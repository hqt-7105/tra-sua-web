/** Ảnh tạm khi món chưa có hình (image = null). TV2 thay bằng ảnh thật sau. */
const ICONS = {
  'tra-sua': '🧋',
  'tra-trai-cay': '🍑',
  'ca-phe': '☕',
  'da-xay': '🥤',
};

export default function DrinkThumb({ drink, size = 'md' }) {
  if (drink.image) {
    return <img className={`thumb thumb--${size}`} src={drink.image} alt={drink.name} />;
  }
  return (
    <div className={`thumb thumb--${size} thumb--${drink.categoryId}`} role="img" aria-label={drink.name}>
      <span>{ICONS[drink.categoryId] || '🧋'}</span>
    </div>
  );
}
