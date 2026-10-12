import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../api/useFetch.js';
import DrinkCard from '../components/DrinkCard.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SkeletonCards } from '../components/Skeleton.jsx';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category') || '';
  const [keyword, setKeyword] = useState('');

  const { data: categories } = useFetch('/categories');
  const query = new URLSearchParams();
  if (categoryId) query.set('categoryId', categoryId);
  if (keyword.trim()) query.set('q', keyword.trim());
  const { data: drinks, loading, error, reload } = useFetch(`/drinks?${query}`);

  const selectCategory = (id) => setSearchParams(id ? { category: id } : {});

  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <h1>Menu</h1>
          <input
            className="input search"
            type="search"
            placeholder="Tìm món..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={!categoryId}
            className={!categoryId ? 'tab active' : 'tab'}
            onClick={() => selectCategory('')}
          >
            Tất cả
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={categoryId === c.id}
              className={categoryId === c.id ? 'tab active' : 'tab'}
              onClick={() => selectCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading && !drinks && <SkeletonCards count={6} />}
        {error && <ErrorBox error={error} title="Không tải được thực đơn" onRetry={reload} />}
        {drinks && drinks.length === 0 && (
          <EmptyState
            icon="🔍"
            title="Không tìm thấy món phù hợp"
            actionLabel="Xem tất cả món"
            onAction={() => {
              setKeyword('');
              selectCategory('');
            }}
          >
            Thử từ khóa khác, ví dụ &quot;trà đào&quot; hoặc &quot;matcha&quot;.
          </EmptyState>
        )}
        {drinks && (
          <div className="grid">
            {drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
