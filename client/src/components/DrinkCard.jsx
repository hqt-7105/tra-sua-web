import { Link } from 'react-router-dom';
import DrinkThumb from './DrinkThumb.jsx';
import { formatPrice } from '../utils/format.js';

export default function DrinkCard({ drink }) {
  return (
    <Link to={`/menu/${drink.id}`} className="card">
      <DrinkThumb drink={drink} />
      <div className="card__body">
        {drink.isBestSeller && <span className="tag">Bán chạy</span>}
        <h3>{drink.name}</h3>
        <p className="muted">{drink.description}</p>
        <div className="card__foot">
          <strong className="price">{formatPrice(drink.basePrice)}</strong>
          <span className="btn btn--sm">Chọn món</span>
        </div>
      </div>
    </Link>
  );
}
