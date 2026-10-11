/** Ảnh món (image trong drinks.json); món chưa có ảnh (image = null) thì hiện biểu tượng theo danh mục. */
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
