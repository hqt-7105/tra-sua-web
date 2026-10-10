import { Link } from 'react-router-dom';
import { useFetch } from '../api/useFetch.js';
import DrinkCard from '../components/DrinkCard.jsx';
import { Loading, ErrorBox } from '../components/Status.jsx';

/**
 * Landing page — bản cơ bản (Sprint 0).
 * TODO(TV2): hoàn thiện theo Figma: ảnh thật, mục Khuyến mãi lấy từ voucher,
 * mục Đánh giá khách hàng, bản đồ cửa hàng, hiệu ứng cuộn, responsive.
 */
export default function Home() {
  const { data: bestSellers, loading, error } = useFetch('/drinks?bestSeller=true');

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
            <div className="hero__cup">🧋</div>
            <div className="hero__bubble hero__bubble--1">-20% ly thứ 2</div>
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
          {loading && <Loading />}
          {error && <ErrorBox error={error} />}
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
            <span className="feature__icon">🍃</span>
            <h3>Trà ủ mỗi sáng</h3>
            <p className="muted">Lá trà tuyển chọn, ủ mới mỗi ngày, không dùng bột pha sẵn.</p>
          </div>
          <div className="feature">
            <span className="feature__icon">🎛️</span>
            <h3>Tùy chỉnh theo ý bạn</h3>
            <p className="muted">5 mức đường, 5 mức đá, 6 loại topping, 2 size.</p>
          </div>
          <div className="feature">
            <span className="feature__icon">🛵</span>
            <h3>Giao nhanh</h3>
            <p className="muted">Theo dõi đơn từ lúc pha chế tới khi giao tới tay.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="promo">
            <div>
              <h2>Khuyến mãi tuần này</h2>
              <p className="muted">Nhập mã ở giỏ hàng để được giảm giá.</p>
            </div>
            <div className="promo__codes">
              <span className="code">MAY10 · Giảm 10%</span>
              <span className="code">FREESHIP · Miễn phí giao</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
