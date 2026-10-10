/**
 * Khung đánh dấu phần việc chưa làm, chỉ dùng trong lúc phát triển.
 * Thành viên làm xong phần nào thì xóa TaskNotice tương ứng.
 */
export default function TaskNotice({ owner, task, pattern, sprint = 1, children }) {
  return (
    <div className="notice">
      <div className="notice__head">
        <span className="notice__owner">{owner}</span>
        <strong>{task}</strong>
        {pattern && <span className="notice__pattern">{pattern}</span>}
      </div>
      <div className="notice__body">{children}</div>
      <p className="notice__ref">Chi tiết: docs/PHAN_CONG_SPRINT_{sprint}.md</p>
    </div>
  );
}
