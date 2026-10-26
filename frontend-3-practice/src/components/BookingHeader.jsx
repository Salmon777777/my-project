export default function BookingHeader({ onBack }) {
  const steps = ["Услуга выбрана", "Мастер выбран", "Дата и время", "Контакты"];
  return (
    <header className="booking__header">
      <div className="status-bar" aria-hidden="true">
        <span className="status-bar__time">9:41</span>
        <span className="status-bar__indicators"><span className="status-bar__signal">●●●</span><span className="status-bar__battery" /></span>
      </div>
      <nav className="navigation" aria-label="Навигация по записи">
        <button className="navigation__back" type="button" onClick={onBack}><span className="navigation__chevron" aria-hidden="true">‹</span> Назад</button>
        <span className="navigation__label">Онлайн-запись</span>
      </nav>
      <section className="progress" aria-label="Шаг 3 из 4: выбор даты и времени">
        <p className="progress__caption">Шаг 3 из 4</p>
        <ol className="progress__steps">
          {steps.map((step, index) => (
            <li key={step} className={`progress__step${index < 3 ? " progress__step--complete" : ""}`} aria-current={index === 2 ? "step" : undefined}>
              <span className="visually-hidden">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </header>
  );
}
