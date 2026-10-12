import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client.js';
import { ErrorBox, Loading } from '../../components/Status.jsx';
import { useToast } from '../../hooks/useToast.js';
import { formatPrice } from '../../utils/format.js';
import { formatDateTime } from '../../utils/orderLabels.js';

/**
 * Quản lý món và topping — TV4 (UC11, UC12). Mọi thao tác đi qua /api/admin/*, nơi
 * MenuServiceProxy kiểm tra quyền và ghi nhật ký. Nhân viên vẫn thấy nút sửa:
 * bấm vào sẽ nhận thông báo 403 từ Proxy (đúng kịch bản demo phân quyền).
 */
const AUDIT_ACTIONS = {
  createDrink: 'Thêm món',
  updateDrink: 'Sửa món',
  deactivateDrink: 'Ngừng bán món',
  createTopping: 'Thêm topping',
  updateTopping: 'Sửa topping',
  deactivateTopping: 'Ngừng bán topping',
};

const EMPTY_DRINK = { name: '', categoryId: '', basePrice: '', description: '', image: '', isBestSeller: false };
const EMPTY_TOPPING = { name: '', price: '' };

/** Ô giá: chuỗi rỗng → null để server báo lỗi đúng ô; còn lại đổi sang số. */
const toPrice = (value) => (value === '' ? null : Number(value));

function Field({ id, label, error, children }) {
  return (
    <div className="admin-form__field">
      <label htmlFor={id} className="field__label">{label}</label>
      {children}
      {error && <p className="field__error" role="alert">{error}</p>}
    </div>
  );
}

function ActiveBadge({ active }) {
  return (
    <span className={active ? 'status-pill status-pill--completed' : 'status-pill status-pill--cancelled'}>
      {active ? 'Đang bán' : 'Ngừng bán'}
    </span>
  );
}

/** Gửi form tạo/sửa, lỗi 400 có field thì hiện dưới ô, lỗi khác hiện trên form. */
function useSaveForm(onSaved) {
  const toast = useToast();
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const save = async (request, successMessage) => {
    setBusy(true);
    setErrors({});
    try {
      const saved = await request();
      toast.show(successMessage(saved), { type: 'success' });
      onSaved(saved);
    } catch (err) {
      setErrors(err.field ? { [err.field]: err.message } : { form: err.message });
    } finally {
      setBusy(false);
    }
  };
  return { errors, busy, save };
}

function DrinkForm({ drink, categories, onSaved, onCancel }) {
  const isNew = !drink.id;
  const [form, setForm] = useState(() => ({
    ...EMPTY_DRINK,
    ...drink,
    basePrice: drink.basePrice ?? '',
    description: drink.description ?? '',
    image: drink.image ?? '',
    categoryId: drink.categoryId ?? categories[0]?.id ?? '',
  }));
  const { errors, busy, save } = useSaveForm(onSaved);
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      basePrice: toPrice(form.basePrice),
      description: form.description,
      image: form.image.trim() || null,
      isBestSeller: form.isBestSeller,
    };
    save(
      () => (isNew ? api.post('/admin/drinks', payload) : api.put(`/admin/drinks/${encodeURIComponent(drink.id)}`, payload)),
      (saved) => `Đã lưu món "${saved.name}"`,
    );
  };

  return (
    <form className="panel admin-form" onSubmit={submit} noValidate>
      <h2 className="panel__title">{isNew ? 'Thêm món mới' : `Sửa món: ${drink.name}`}</h2>
      {errors.form && <p className="error" role="alert">{errors.form}</p>}
      <div className="admin-form__grid">
        <Field id="drink-name" label="Tên món" error={errors.name}>
          <input id="drink-name" className="input input--block" value={form.name} onChange={set('name')} />
        </Field>
        <Field id="drink-category" label="Danh mục" error={errors.categoryId}>
          <select id="drink-category" className="input input--block" value={form.categoryId} onChange={set('categoryId')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field id="drink-price" label="Giá size M (VND)" error={errors.basePrice}>
          <input
            id="drink-price"
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            className="input input--block"
            value={form.basePrice}
            onChange={set('basePrice')}
          />
        </Field>
        <Field id="drink-image" label="Ảnh (đường dẫn, để trống nếu chưa có)" error={errors.image}>
          <input
            id="drink-image"
            className="input input--block"
            placeholder="/images/drinks/ten-mon.svg"
            value={form.image}
            onChange={set('image')}
          />
        </Field>
      </div>
      <Field id="drink-description" label="Mô tả" error={errors.description}>
        <textarea
          id="drink-description"
          className="input input--block"
          rows={2}
          value={form.description}
          onChange={set('description')}
        />
      </Field>
      <label className="admin-form__check">
        <input type="checkbox" checked={form.isBestSeller} onChange={set('isBestSeller')} /> Món bán chạy
      </label>
      <div className="admin-form__actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu món'}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}

function ToppingForm({ topping, onSaved, onCancel }) {
  const isNew = !topping.id;
  const [form, setForm] = useState(() => ({ ...EMPTY_TOPPING, ...topping, price: topping.price ?? '' }));
  const { errors, busy, save } = useSaveForm(onSaved);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = { name: form.name, price: toPrice(form.price) };
    save(
      () =>
        isNew ? api.post('/admin/toppings', payload) : api.put(`/admin/toppings/${encodeURIComponent(topping.id)}`, payload),
      (saved) => `Đã lưu topping "${saved.name}"`,
    );
  };

  return (
    <form className="panel admin-form" onSubmit={submit} noValidate>
      <h2 className="panel__title">{isNew ? 'Thêm topping' : `Sửa topping: ${topping.name}`}</h2>
      {errors.form && <p className="error" role="alert">{errors.form}</p>}
      <div className="admin-form__grid">
        <Field id="topping-name" label="Tên topping" error={errors.name}>
          <input id="topping-name" className="input input--block" value={form.name} onChange={set('name')} />
        </Field>
        <Field id="topping-price" label="Giá (VND)" error={errors.price}>
          <input
            id="topping-price"
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            className="input input--block"
            value={form.price}
            onChange={set('price')}
          />
        </Field>
      </div>
      <div className="admin-form__actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu topping'}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}

/** Danh sách + form dùng chung cho món và topping. */
function useAdminList(path) {
  const toast = useToast();
  const [state, setState] = useState({ items: null, error: null });
  const load = useCallback(() => {
    api
      .get(`${path}?includeInactive=true`)
      .then((items) => setState({ items, error: null }))
      .catch((error) => setState({ items: null, error }));
  }, [path]);
  useEffect(load, [load]);

  /** Ngừng bán (DELETE) hoặc mở bán lại (PUT isActive). Lỗi 403 của Proxy hiện bằng toast. */
  const toggleActive = async (item) => {
    try {
      const id = encodeURIComponent(item.id);
      const saved = item.isActive ? await api.delete(`${path}/${id}`) : await api.put(`${path}/${id}`, { isActive: true });
      toast.show(saved.isActive ? `Đã mở bán lại "${saved.name}"` : `Đã ngừng bán "${saved.name}"`, { type: 'success' });
      load();
    } catch (err) {
      toast.show(err.message, { type: 'error', duration: 5000 });
    }
  };
  return { ...state, load, toggleActive };
}

function DrinksTab() {
  const { items: drinks, error, load, toggleActive } = useAdminList('/admin/drinks');
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!drinks) return <Loading />;
  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id;

  return (
    <>
      {editing ? (
        <DrinkForm
          key={editing.id ?? 'new'}
          drink={editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      ) : (
        <button type="button" className="btn admin-menu__add" onClick={() => setEditing({})}>+ Thêm món</button>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>Món</th>
            <th>Danh mục</th>
            <th>Giá (M)</th>
            <th>Bán chạy</th>
            <th>Trạng thái</th>
            <th><span className="sr-only">Thao tác</span></th>
          </tr>
        </thead>
        <tbody>
          {drinks.map((drink) => (
            <tr key={drink.id} className={drink.isActive ? undefined : 'data-table__row--muted'}>
              <td data-label="Món">
                <span>
                  <strong>{drink.name}</strong>
                  <small className="muted data-table__sub">{drink.id}</small>
                </span>
              </td>
              <td data-label="Danh mục">{categoryName(drink.categoryId)}</td>
              <td data-label="Giá (M)" className="price">{formatPrice(drink.basePrice)}</td>
              <td data-label="Bán chạy">{drink.isBestSeller ? '★ Có' : '—'}</td>
              <td data-label="Trạng thái"><ActiveBadge active={drink.isActive} /></td>
              <td className="data-table__actions">
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setEditing(drink)}>Sửa</button>
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => toggleActive(drink)}>
                  {drink.isActive ? 'Ngừng bán' : 'Mở bán lại'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ToppingsTab() {
  const { items: toppings, error, load, toggleActive } = useAdminList('/admin/toppings');
  const [editing, setEditing] = useState(null);

  if (error) return <ErrorBox error={error} />;
  if (!toppings) return <Loading />;

  return (
    <>
      {editing ? (
        <ToppingForm
          key={editing.id ?? 'new'}
          topping={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      ) : (
        <button type="button" className="btn admin-menu__add" onClick={() => setEditing({})}>+ Thêm topping</button>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>Topping</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th><span className="sr-only">Thao tác</span></th>
          </tr>
        </thead>
        <tbody>
          {toppings.map((topping) => (
            <tr key={topping.id} className={topping.isActive ? undefined : 'data-table__row--muted'}>
              <td data-label="Topping"><strong>{topping.name}</strong></td>
              <td data-label="Giá" className="price">{formatPrice(topping.price)}</td>
              <td data-label="Trạng thái"><ActiveBadge active={topping.isActive} /></td>
              <td className="data-table__actions">
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setEditing(topping)}>Sửa</button>
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => toggleActive(topping)}>
                  {topping.isActive ? 'Ngừng bán' : 'Mở bán lại'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AuditTab() {
  const [state, setState] = useState({ entries: null, error: null });
  useEffect(() => {
    api
      .get('/admin/audit-log')
      .then((entries) => setState({ entries, error: null }))
      .catch((error) => setState({ entries: null, error }));
  }, []);

  if (state.error) return <ErrorBox error={state.error} />;
  if (!state.entries) return <Loading />;
  if (state.entries.length === 0) return <p className="muted">Chưa có thao tác sửa menu nào.</p>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Thời điểm</th>
          <th>Người làm</th>
          <th>Hành động</th>
          <th>Đối tượng</th>
        </tr>
      </thead>
      <tbody>
        {state.entries.map((entry, i) => (
          <tr key={`${entry.at}-${i}`}>
            <td data-label="Thời điểm">{formatDateTime(entry.at)}</td>
            <td data-label="Người làm">{entry.email}</td>
            <td data-label="Hành động">{AUDIT_ACTIONS[entry.action] ?? entry.action}</td>
            <td data-label="Đối tượng"><code>{entry.targetId}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TABS = [
  { id: 'drinks', label: 'Món', Panel: DrinksTab },
  { id: 'toppings', label: 'Topping', Panel: ToppingsTab },
  { id: 'audit', label: 'Nhật ký', Panel: AuditTab, adminOnly: true },
];

export default function AdminMenu() {
  const { user } = useOutletContext();
  const [tab, setTab] = useState('drinks');
  const tabs = TABS.filter((t) => !t.adminOnly || user?.role === 'admin');
  const { Panel } = tabs.find((t) => t.id === tab) ?? tabs[0];

  return (
    <>
      <h1>Menu &amp; topping</h1>
      {user?.role === 'staff' && (
        <p className="admin-menu__note">
          Bạn đăng nhập với vai trò <strong>nhân viên</strong>: được xem menu, thao tác sửa sẽ bị từ chối.
        </p>
      )}
      <div className="tabs" role="tablist" aria-label="Quản lý menu">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Panel />
    </>
  );
}
