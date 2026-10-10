import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../api/useFetch.js';
import DrinkThumb from '../components/DrinkThumb.jsx';
import TaskNotice from '../components/TaskNotice.jsx';
import { Loading, ErrorBox } from '../components/Status.jsx';
import { formatPrice } from '../utils/format.js';

export default function DrinkDetail() {
  const { id } = useParams();
  const { data: drink, loading, error } = useFetch(`/drinks/${id}`);

  return (
    <section className="section">
      <div className="container">
        <Link to="/menu" className="link">← Quay lại menu</Link>
        {loading && <Loading />}
        {error && <ErrorBox error={error} />}
        {drink && (
          <div className="detail">
            <DrinkThumb drink={drink} size="lg" />
            <div>
              <h1>{drink.name}</h1>
              <p className="lead">{drink.description}</p>
              <p className="price price--lg">Từ {formatPrice(drink.basePrice)}</p>

              <TaskNotice owner="TV3" task="Form tùy chỉnh món" pattern="Builder + Decorator">
                <ul>
                  <li>Chọn size (M/L), mức đường, mức đá, topping (nhiều), số lượng, ghi chú — lấy từ <code>GET /api/options</code> và <code>GET /api/toppings</code></li>
                  <li>Mỗi lần đổi lựa chọn gọi <code>POST /api/cart/price</code> để hiện giá</li>
                  <li>Nút &quot;Thêm vào giỏ&quot; gọi <code>CartStore.getInstance().addItem()</code> (TV2)</li>
                </ul>
              </TaskNotice>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
