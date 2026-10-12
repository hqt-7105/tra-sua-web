import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useFetch } from '../api/useFetch.js';
import DrinkThumb from '../components/DrinkThumb.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonDetail } from '../components/Skeleton.jsx';
import { useCart } from '../store/useCart.js';
import { MAX_QUANTITY } from '../store/cartStore.js';
import { formatPrice } from '../utils/format.js';

/** Mỗi loại topping chọn tối đa 3 phần (BR04: chọn trùng thì cộng giá nhiều lần). */
const MAX_SAME_TOPPING = 3;
const NOTE_MAX_LENGTH = 200;
/** Chờ người dùng ngừng gõ ghi chú rồi mới tính giá. */
const PRICE_DELAY_MS = 200;

/** Khóa gộp dòng trong giỏ (BR05): cùng món và cùng mọi tùy chọn. */
const cartKey = ({ drinkId, size, sugar, ice, toppings, note }) =>
  [drinkId, size, sugar, ice, toppings.map((t) => t.id).sort().join(','), note].join('|');

function Stepper({ value, min, max, onChange, label }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Bớt ${label}`}
      >
        −
      </button>
      <span className="stepper__value" aria-live="polite">{value}</span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Thêm ${label}`}
      >
        +
      </button>
    </div>
  );
}

function Choice({ legend, name, choices, value, onChange }) {
  return (
    <fieldset className="choice">
      <legend className="field__label">{legend}</legend>
      <div className="choice__options">
        {choices.map((choice) => (
          <label key={choice.value} className={`pill${choice.value === value ? ' pill--active' : ''}`}>
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={choice.value === value}
              onChange={() => onChange(choice.value)}
            />
            {choice.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const levelChoices = (levels) => levels.map((level) => ({ value: level, label: `${level}%` }));

/** Dòng món gửi lên POST /api/cart/price (cùng dạng một dòng của POST /api/orders). */
function toRequest(drinkId, selection, toppings) {
  const toppingIds = toppings.flatMap((t) => Array(selection.toppingCounts[t.id] ?? 0).fill(t.id));
  const { size, sugar, ice, quantity, note } = selection;
  return { drinkId, size, sugar, ice, toppingIds, quantity, note };
}

function CustomizeForm({ drink, options, toppings }) {
  const { items, cart } = useCart();
  const { allowToppings, allowSugar, allowIce } = drink.customization;
  const [selection, setSelection] = useState(() => ({
    size: options.defaults.size,
    sugar: options.defaults.sugar,
    ice: options.defaults.ice,
    toppingCounts: {},
    quantity: options.defaults.quantity,
    note: '',
  }));
  const [priced, setPriced] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');
  const lastValid = useRef(selection);
  const requestId = useRef(0);

  const request = toRequest(drink.id, selection, toppings);
  const requestKey = JSON.stringify(request);
  const isPricing = priced?.requestKey !== requestKey;

  // Mỗi lần đổi lựa chọn: server tính lại giá (BR02). Lỗi thì quay về lựa chọn hợp lệ gần nhất.
  useEffect(() => {
    if (!isPricing) return undefined;
    const id = ++requestId.current;
    const timer = setTimeout(
      () => {
        api
          .post('/cart/price', JSON.parse(requestKey))
          .then((item) => {
            if (id !== requestId.current) return;
            lastValid.current = selection;
            setPriced({ ...item, requestKey });
            setError('');
          })
          .catch((err) => {
            if (id !== requestId.current) return;
            setError(err.message);
            setSelection(lastValid.current);
          });
      },
      priced ? PRICE_DELAY_MS : 0,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const update = (patch) => {
    setAdded('');
    setSelection((current) => ({ ...current, ...patch }));
  };

  const setToppingCount = (toppingId, count) => {
    setAdded('');
    setSelection((current) => ({
      ...current,
      toppingCounts: { ...current.toppingCounts, [toppingId]: count },
    }));
  };

  const addToCart = () => {
    const key = cartKey(priced);
    const inCart = items.find((item) => item.key === key)?.quantity ?? 0;
    const quantity = Math.min(priced.quantity, MAX_QUANTITY - inCart);
    if (quantity <= 0) {
      setAdded('');
      setError(`Giỏ đã có ${MAX_QUANTITY} ly món này (tối đa ${MAX_QUANTITY} ly mỗi món).`);
      return;
    }
    const { drinkId, description, size, sugar, ice, toppings: chosen, unitPrice, note } = priced;
    cart.addItem({ key, drinkId, description, size, sugar, ice, toppings: chosen, unitPrice, quantity, note });
    setError('');
    setAdded(
      quantity < priced.quantity
        ? `Đã thêm ${quantity} ly (mỗi món tối đa ${MAX_QUANTITY} ly).`
        : `Đã thêm ${quantity} ly vào giỏ.`,
    );
  };

  return (
    <form className="customize" onSubmit={(e) => e.preventDefault()} noValidate>
      <Choice
        legend="Size"
        name="size"
        value={selection.size}
        onChange={(size) => update({ size })}
        choices={options.sizes.map((s) => ({
          value: s.id,
          label: s.extraPrice > 0 ? `${s.name} +${formatPrice(s.extraPrice)}` : s.name,
        }))}
      />

      {allowSugar && (
        <Choice
          legend="Mức đường"
          name="sugar"
          value={selection.sugar}
          onChange={(sugar) => update({ sugar })}
          choices={levelChoices(options.sugarLevels)}
        />
      )}

      {allowIce ? (
        <Choice
          legend="Mức đá"
          name="ice"
          value={selection.ice}
          onChange={(ice) => update({ ice })}
          choices={levelChoices(options.iceLevels)}
        />
      ) : (
        <p className="customize__rule">{drink.categoryName} xay cùng đá theo công thức, không chỉnh mức đá.</p>
      )}

      {allowToppings ? (
        <fieldset className="choice">
          <legend className="field__label">Topping</legend>
          <ul className="topping-list">
            {toppings.map((topping) => (
              <li key={topping.id} className="topping-row">
                <span>
                  {topping.name} <span className="topping-row__price">+{formatPrice(topping.price)}</span>
                </span>
                <Stepper
                  label={topping.name}
                  value={selection.toppingCounts[topping.id] ?? 0}
                  min={0}
                  max={MAX_SAME_TOPPING}
                  onChange={(count) => setToppingCount(topping.id, count)}
                />
              </li>
            ))}
          </ul>
        </fieldset>
      ) : (
        <p className="customize__rule">{drink.categoryName} pha theo công thức, không thêm topping.</p>
      )}

      <div className="choice">
        <label htmlFor="item-note" className="field__label">Ghi chú</label>
        <input
          id="item-note"
          className="input input--block"
          placeholder="Ví dụ: ít ngọt, để riêng đá"
          maxLength={NOTE_MAX_LENGTH}
          value={selection.note}
          onChange={(e) => update({ note: e.target.value })}
        />
      </div>

      <div className="choice customize__quantity">
        <span className="field__label">Số lượng</span>
        <Stepper
          label="số lượng"
          value={selection.quantity}
          min={1}
          max={MAX_QUANTITY}
          onChange={(quantity) => update({ quantity })}
        />
      </div>

      {error && <p className="field__error" role="alert">{error}</p>}
      {added && (
        <p className="customize__added" role="status">
          {added} <Link to="/cart" className="link">Xem giỏ hàng →</Link>
        </p>
      )}

      <div className="buy-bar">
        <div>
          <span className="muted buy-bar__label">Thành tiền</span>
          <strong className="price price--lg" aria-live="polite">
            {priced ? formatPrice(priced.totalPrice) : '...'}
          </strong>
        </div>
        <button type="button" className="btn btn--lg" onClick={addToCart} disabled={isPricing || !priced}>
          {isPricing && !error ? 'Đang tính giá...' : 'Thêm vào giỏ'}
        </button>
      </div>
    </form>
  );
}

export default function DrinkDetail() {
  const { id } = useParams();
  const drink = useFetch(`/drinks/${id}`);
  const options = useFetch('/options');
  const toppings = useFetch('/toppings');

  const error = drink.error || options.error || toppings.error;
  const ready = drink.data && options.data && toppings.data;

  return (
    <section className="section">
      <div className="container">
        <Link to="/menu" className="link">← Quay lại menu</Link>
        {error && drink.error?.status === 404 && (
          <EmptyState icon="🔍" title="Không tìm thấy món" actionLabel="Về menu" actionTo="/menu">
            Món này không có hoặc đã ngừng bán.
          </EmptyState>
        )}
        {error && drink.error?.status !== 404 && (
          <ErrorBox
            error={error}
            title="Không tải được món"
            onRetry={() => [drink, options, toppings].forEach((request) => request.reload())}
          />
        )}
        {!error && !ready && <SkeletonDetail />}
        {!error && ready && (
          <div className="detail">
            <DrinkThumb drink={drink.data} size="lg" />
            <div>
              <span className="tag">{drink.data.categoryName}</span>
              <h1>{drink.data.name}</h1>
              <p className="lead">{drink.data.description}</p>
              <p className="price price--lg">Từ {formatPrice(drink.data.basePrice)}</p>
              <CustomizeForm
                key={drink.data.id}
                drink={drink.data}
                options={options.data}
                toppings={toppings.data}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
