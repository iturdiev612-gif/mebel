import { useState } from 'react';
import Icon from './Icons';
import { bookingMessage, CONTACT, COUNTRIES, normalizePhone, whatsappLink } from './catalog';
export default function BookingForm({ items }) {
  const [countryId, setCountryId] = useState('kg');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [sentLink, setSentLink] = useState('');
  const country = COUNTRIES.find((item) => item.id === countryId);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  function submit(event) {
    event.preventDefault();
    const link = whatsappLink(bookingMessage({ items, name, country, phone, city, date, comment }));
    setSentLink(link);
    window.open(link, '_blank', 'noopener,noreferrer');
  }
  return <form className="booking-form" onSubmit={submit}>
    <p className="modal-intro">Оставьте детали — подготовим сообщение менеджеру. Обсудите условия и подтвердите бронирование с владельцем в WhatsApp.</p>
    <div className="booking-summary"><Icon name="bag" /><div><strong>{items.reduce((sum, item) => sum + item.quantity, 0)} шт. в заявке</strong><span>{items.map(({ product, quantity }) => `${product.name} × ${quantity}`).join(' · ')}</span></div></div>
    <label className="form-field">Ваше имя <span className="required">*</span><input name="name" autoComplete="name" placeholder="Как к вам обращаться?" value={name} onChange={(e) => { setName(e.target.value); setSentLink(''); }} maxLength={80} required pattern=".*\S.*" /></label>
    <label className="form-field">Страна<select aria-label="Страна номера телефона" value={countryId} onChange={(e) => { setCountryId(e.target.value); setPhone(''); setSentLink(''); }}>{COUNTRIES.map((item) => <option key={item.id} value={item.id}>{item.flag} {item.name} ({item.prefix})</option>)}</select></label>
    <label className="form-field" htmlFor="booking-phone">Номер телефона <span className="required">*</span></label>
    <div className="phone-field"><span className="phone-prefix" aria-label="Код страны">{country.prefix}</span><input id="booking-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={country.placeholder} value={phone} onChange={(e) => { setPhone(normalizePhone(e.target.value, country)); setSentLink(''); }} onPaste={(e) => { e.preventDefault(); setPhone(normalizePhone(e.clipboardData.getData('text'), country)); setSentLink(''); }} maxLength={country.digits} minLength={country.digits} pattern={`[0-9]{${country.digits}}`} title={`Введите ${country.digits} цифр после ${country.prefix}`} aria-describedby="phone-hint" required /></div>
    <small id="phone-hint" className="field-hint">Только цифры · {phone.length} из {country.digits} · код страны уже указан</small>
    <div className="form-row"><label className="form-field">Город / адрес<input name="city" autoComplete="address-level2" placeholder="Например, Бишкек" value={city} onChange={(e) => { setCity(e.target.value); setSentLink(''); }} maxLength={160} /></label><label className="form-field">Желаемая дата<input name="date" type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setSentLink(''); }} /></label></div>
    <label className="form-field">Дополнительные пожелания<textarea name="comment" rows={3} placeholder="Размеры, цвет, вопросы о комплектации…" value={comment} onChange={(e) => { setComment(e.target.value); setSentLink(''); }} maxLength={1500} /></label>
    <div className="form-note"><Icon name="shield" size={18} /><span>Данные попадут только в подготовленное сообщение. Нажмите «Отправить» в WhatsApp, чтобы передать заявку менеджеру.</span></div>
    <button type="submit" className="button primary full-width"><Icon name="whatsapp" size={21} />Продолжить в WhatsApp<Icon name="arrowUp" size={18} /></button>
    <p className="booking-contact">Менеджер: <a href={`tel:${CONTACT.phone}`}>{CONTACT.display}</a></p>
    {sentLink && <div className="booking-result" role="status"><strong>Сообщение подготовлено</strong><p>Отправьте его в WhatsApp. Бронь будет оформлена после подтверждения менеджером.</p><a href={sentLink} target="_blank" rel="noreferrer">Открыть WhatsApp ещё раз <Icon name="arrowUp" size={16} /></a></div>}
  </form>;
}

