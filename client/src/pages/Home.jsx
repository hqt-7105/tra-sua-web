import { Link } from 'react-router-dom';
import { useFetch } from '../api/useFetch.js';
import DrinkCard from '../components/DrinkCard.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { SkeletonCards } from '../components/Skeleton.jsx';
import { formatPrice } from '../utils/format.js';

const REVIEWS = [
  {
    name: 'Minh Thư',
    note: 'Khách quen · Quận 1',
    text: 'Trà sữa Ô Long thơm mùi trà rõ, chọn 50% đường là vừa miệng. Đặt online 25 phút đã có.',
  },
  {
    name: 'Hoàng Nam',
    note: 'Đặt cho cả phòng',
    text: 'Đặt 8 ly mỗi ly một kiểu đá, đường mà giao đúng hết. Trang theo dõi đơn rất tiện.',
  },
  {
    name: 'Thu Hà',
    note: 'Fan trân châu',
    text: 'Trân châu hoàng kim dai mềm, sữa tươi đường đen đậm vị. Hay dùng mã FREESHIP.',
  },
];

const STORE = {
  address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  hours: '08:00 – 22:00 mỗi ngày (nhận đơn online tới 21:59)',
  hotline: '0900 000 000',
};

function Promotions() {
  const { data: vouchers, error } = useFetch('/vouchers');
  return (
    <div className="promo">
      <div>
        <h2>Khuyến mãi tuần này</h2>
        <p className="muted">Nhập mã ở giỏ hàng để được giảm giá.</p>
      </div>
      {error && <p className="muted">Chưa tải được mã khuyến mãi, bạn thử lại sau nhé.</p>}
      {vouchers && (
        <ul className="promo__codes">
          {vouchers.map((v) => (
            <li key={v.code} className="code">
              <strong>{v.code}</strong> · {v.message}
              {v.minOrder > 0 && <span className="code__min">Đơn từ {formatPrice(v.minOrder)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Landing page — TV2. */
export default function Home() {
  const { data: bestSellers, loading, error, reload } = useFetch('/drinks?bestSeller=true');

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <p className="eyebrow">Trà sữa nhà làm · Giao trong 30 phút</p>
            <h1>
              Ngọt vừa đủ,
              <br />
              <em>thơm trọn vị trà.</em>
            </h1>
            <p className="lead">
              Tự chọn size, độ ngọt, lượng đá và topping yêu thích. Đặt online, nhận ly
              trà sữa đúng ý bạn.
            </p>
            <div className="hero__actions">
              <Link to="/menu" className="btn btn--lg">Đặt ngay</Link>
              <a href="#best-seller" className="btn btn--ghost btn--lg">Món bán chạy</a>
            </div>
          </div>
          <div className="hero__visual" aria-hidden>
            <div className="hero__cup">
              <img src="/images/drinks/ts-duong-den.svg" alt="" />
            </div>
            <div className="hero__bubble hero__bubble--1">5 mức đường, 5 mức đá</div>
            <div className="hero__bubble hero__bubble--2">Freeship từ 99k</div>
          </div>
        </div>
      </section>

      <section id="best-seller" className="section">
        <div className="container">
          <div className="section__head">
            <h2>Món bán chạy</h2>
            <Link to="/menu" className="link">Xem cả menu →</Link>
          </div>
          {loading && <SkeletonCards count={4} />}
          {error && <ErrorBox error={error} title="Không tải được món bán chạy" onRetry={reload} />}
          {bestSellers && (
            <div className="grid">
              {bestSellers.map((drink) => (
                <DrinkCard key={drink.id} drink={drink} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container features">
          <div className="feature">
            <span className="feature__icon" aria-hidden>🍃</span>
            <h3>Trà ủ mỗi sáng</h3>
            <p className="muted">Lá trà tuyển chọn, ủ mới mỗi ngày, không dùng bột pha sẵn.</p>
          </div>
          <div className="feature">
            <span className="feature__icon" aria-hidden>🎛️</span>
            <h3>Tùy chỉnh theo ý bạn</h3>
            <p className="muted">5 mức đường, 5 mức đá, 6 loại topping, 2 size.</p>
          </div>
          <div className="feature">
            <span className="feature__icon" aria-hidden>🛵</span>
            <h3>Giao nhanh</h3>
            <p className="muted">Theo dõi đơn từ lúc pha chế tới khi giao tới tay.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Promotions />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2>Khách hàng nói gì</h2>
          <ul className="reviews">
            {REVIEWS.map((review) => (
              <li key={review.name} className="review">
                <p className="review__stars" aria-label="5 trên 5 sao">★★★★★</p>
                <blockquote>“{review.text}”</blockquote>
                <p className="review__author">
                  <strong>{review.name}</strong>
                  <span className="muted"> · {review.note}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="cua-hang">
        <div className="container store">
          <div>
            <h2>Ghé cửa hàng</h2>
            <dl className="store__info">
              <dt>Địa chỉ</dt>
              <dd>{STORE.address}</dd>
              <dt>Giờ mở cửa</dt>
              <dd>{STORE.hours}</dd>
              <dt>Hotline</dt>
              <dd>{STORE.hotline}</dd>
            </dl>
            <Link to="/menu" className="btn">Xem menu và đặt online</Link>
          </div>
          <img
            className="store__map"
            src="/images/store-map.svg"
            alt={`Bản đồ vị trí cửa hàng tại ${STORE.address}`}
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
