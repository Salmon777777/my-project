export default function StatusPanel({ loading, error, onRetry, loadingText = "Загрузка слотов…" }) {
  return <div className="request-status" aria-busy={loading}>
    {loading ? <p className="request-status__text" role="status">{loadingText}</p> : <>
      <p className="request-status__text" role="alert">{error || "Не удалось загрузить данные."}</p>
      <button className="request-status__retry" type="button" onClick={onRetry}>Повторить попытку</button>
    </>}
  </div>;
}
