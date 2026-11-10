import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import BookingForm from './BookingForm';
import { bookingMessage, CONTACT, COUNTRIES, normalizePhone, PRODUCTS, whatsappLink } from './catalog';

beforeEach(() => { localStorage.clear(); });

test.each(COUNTRIES)('$name: phone accepts only digits and caps the national number at $digits', (country) => {
  expect(normalizePhone('abc 123!456-789 012345', country)).toMatch(new RegExp(`^[0-9]{${country.digits}}$`));
  const national = country.id === 'kg' ? '704665501' : '9001234567';
  expect(normalizePhone(`${country.prefix} ${national}`, country)).toBe(national);
});

test('country selector keeps the prefix separate and changes the exact input length', () => {
  render(<BookingForm items={[{ product: PRODUCTS[0], quantity: 1 }]} />);
  const phone = screen.getByLabelText(/Номер телефона/);
  expect(screen.getByLabelText('Код страны')).toHaveTextContent('+996');
  fireEvent.change(phone, { target: { value: '70x4-665501999' } });
  expect(phone).toHaveValue('704665501');
  expect(phone).toHaveAttribute('maxLength', '9');
  fireEvent.change(screen.getByLabelText('Страна номера телефона'), { target: { value: 'ru' } });
  expect(phone).toHaveValue('');
  expect(screen.getByLabelText('Код страны')).toHaveTextContent('+7');
  expect(phone).toHaveAttribute('maxLength', '10');
  fireEvent.change(phone, { target: { value: '900abc1234567890' } });
  expect(phone).toHaveValue('9001234567');
  fireEvent.change(screen.getByLabelText('Страна номера телефона'), { target: { value: 'kz' } });
  expect(phone).toHaveValue('');
  fireEvent.paste(phone, { clipboardData: { getData: () => '+7 (700) 123-45-67' } });
  expect(phone).toHaveValue('7001234567');
});

test('booking sends every selected item and customer detail to the owner number', () => {
  const items = [{ product: PRODUCTS[0], quantity: 2 }, { product: PRODUCTS[1], quantity: 1 }];
  const message = bookingMessage({ items, name: ' Айбек ', country: COUNTRIES[0], phone: '704665501', city: ' Бишкек ', date: '2026-12-01', comment: 'Хочу уточнить размеры' });
  const url = new URL(whatsappLink(message));
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe(`/${CONTACT.whatsapp}`);
  expect(url.searchParams.get('text')).toContain('MD-001 — 2 шт.');
  expect(message).toContain('MD-002 — 1 шт.');
  expect(message).toContain('Имя: Айбек');
  expect(message).toContain('Телефон: +996704665501');
  expect(message).toContain('01.12.2026');
  expect(message).toContain('Хочу уточнить размеры');
});

test('booking handoff opens WhatsApp with the selected product and the complete phone', () => {
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  render(<BookingForm items={[{ product: PRODUCTS[0], quantity: 2 }]} />);
  fireEvent.change(screen.getByLabelText(/Ваше имя/), { target: { value: 'Тестовый покупатель' } });
  fireEvent.change(screen.getByLabelText(/Номер телефона/), { target: { value: '704665501' } });
  fireEvent.click(screen.getByRole('button', { name: 'Продолжить в WhatsApp' }));
  expect(open).toHaveBeenCalledTimes(1);
  const url = new URL(open.mock.calls[0][0]);
  expect(url.searchParams.get('text')).toContain('Телефон: +996704665501');
  expect(url.searchParams.get('text')).toContain('MD-001 — 2 шт.');
  expect(screen.getByRole('status')).toHaveTextContent('Сообщение подготовлено');
  open.mockRestore();
});

test('cart quantity, favorites, and theme survive remounting', () => {
  const first = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'В корзину: Лагуна' }));
  fireEvent.click(screen.getByRole('button', { name: 'В избранное: Лагуна' }));
  fireEvent.click(screen.getByRole('button', { name: 'Включить тёмную тему' }));
  fireEvent.click(screen.getByRole('button', { name: 'Корзина, товаров: 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Увеличить количество: Лагуна' }));
  expect(screen.getByLabelText('Количество: Лагуна')).toHaveTextContent('2');
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть окно' }));
  first.unmount();
  render(<App />);
  expect(screen.getByRole('button', { name: 'Корзина, товаров: 2' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Избранное, товаров: 1' })).toBeInTheDocument();
  expect(document.documentElement.dataset.theme).toBe('dark');
});

test('catalog searches by article and resets an empty search', () => {
  render(<App />);
  const search = screen.getByRole('searchbox', { name: 'Поиск мебели' });
  fireEvent.change(search, { target: { value: 'MD-025' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(within(screen.getByRole('article')).getByText('Кантри')).toBeInTheDocument();
  fireEvent.change(search, { target: { value: 'нет такой мебели' } });
  expect(screen.getByText('Пока ничего не нашлось')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Показать всю мебель' }));
  expect(screen.getAllByRole('article')).toHaveLength(9);
});

test('malformed saved data falls back to an empty cart and favorites', () => {
  localStorage.setItem('mebel-cart', JSON.stringify([{ id: 'unknown', quantity: -1 }]));
  localStorage.setItem('mebel-favorites', '{broken');
  render(<App />);
  expect(screen.getByRole('button', { name: 'Корзина, товаров: 0' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Избранное, товаров: 0' })).toBeInTheDocument();
});
