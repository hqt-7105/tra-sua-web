import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { formatPrice } from '../utils/format.js';

/**
 * Ô nhập mã giảm giá — TV4. Cách tính giảm nằm ở server (Strategy), component
 * chỉ gửi mã + tạm tính và hiển thị kết quả.
 *
 * Props:
 *   subtotal     tạm tính hiện tại (VND); đổi thì mã đang áp được kiểm tra lại
 *   initialCode  mã đã áp trước đó (ví dụ lưu trong giỏ), tự kiểm tra khi mở trang
 *   onChange     (result | null) => void; result = phản hồi của POST /vouchers/validate
 */
export default function VoucherInput({ subtotal, initialCode = '', onChange }) {
  const [code, setCode] = useState(initialCode);
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const appliedCode = useRef(initialCode);

  const apply = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await api.post('/vouchers/validate', { code: trimmed, subtotal });
      if (id !== requestId.current) return;
      appliedCode.current = result.code;
      setApplied(result);
      setCode(result.code);
      setError('');
      onChangeRef.current?.(result);
    } catch (err) {
      if (id !== requestId.current) return;
      appliedCode.current = '';
      setApplied(null);
      setError(err.message);
      onChangeRef.current?.(null);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  // Giỏ thay đổi (hoặc mở trang với mã đã lưu) → kiểm tra lại mã đang áp.
  useEffect(() => {
    if (appliedCode.current) apply(appliedCode.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const remove = () => {
    requestId.current++;
    appliedCode.current = '';
    setApplied(null);
    setCode('');
    setError('');
    setLoading(false);
    onChangeRef.current?.(null);
  };

  const submit = (e) => {
    e.preventDefault();
    apply(code);
  };

  return (
    <div className="voucher">
      {applied ? (
        <div className="voucher__applied" role="status">
          <div>
            <strong className="voucher__code">{applied.code}</strong>
            <p className="muted">{applied.message}</p>
          </div>
          <div className="voucher__amount">
            <strong>−{formatPrice(applied.discount)}</strong>
            <button type="button" className="link-btn" onClick={remove}>
              Bỏ mã
            </button>
          </div>
        </div>
      ) : (
        <form className="voucher__form" onSubmit={submit} noValidate>
          <label htmlFor="voucher-code" className="field__label">
            Mã giảm giá
          </label>
          <div className="voucher__row">
            <input
              id="voucher-code"
              className="input"
              placeholder="Ví dụ: MAY10"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'voucher-error' : undefined}
              autoComplete="off"
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p id="voucher-error" className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
