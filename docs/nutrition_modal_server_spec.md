# Fizio — ТЗ для сервера: модалка «Добавить питание» (ежедневный план)

Цель: из одного модального окна на фронте пользователь должен:
- искать продукты ТОЛЬКО в локальной базе продуктов;
- собрать несколько позиций (без ограничений) с граммами/порциями;
- выбрать тип приёма (breakfast/lunch/dinner);
- применить состав на 1 день или на диапазон дат/выбранные дни недели;
- получить корректные итоги (ккал/Б/Ж/У) от сервера (без расчётов на фронте).

Ниже — минимальные новые эндпоинты, которые добавляются поверх текущего API. Старые эндпоинты `GET /nutrition/daily`, `GET /nutrition/plan`, CRUD `NutritionController` — НЕ трогаем.

---

## 1) Поиск продуктов (локальная БД)

Требование: поиск только по локальным продуктам. Можно ИСПОЛЬЗОВАТЬ уже существующий маршрут `GET /api/local-products/search` (контракт сохранится), либо добавить алиас `GET /api/products/search`, который проксирует в локальный поиск и нормализует ответ (рекомендуется — стабильный контракт для фронта).

### Вариант А (использовать существующий):
- `GET /api/local-products/search?q={строка}&page={n}&per_page={n}` — уже есть в проекте.
- `GET /api/local-products/barcode/{barcode}` — по штрих‑коду (по желанию).

### Вариант Б (добавить алиас):
```php
// routes/api.php
Route::prefix('products')->middleware('auth:sanctum')->group(function () {
    Route::get('search', [\App\Http\Controllers\API\ProductSearchController::class, 'searchLocal']);
    Route::get('{id}',   [\App\Http\Controllers\API\ProductSearchController::class, 'showLocal']);
});
```
Контроллер `searchLocal()` внутри дергает `LocalProductsController::searchProducts` и приводит выдачу к единому виду:
```json
{
  "items": [
    {
      "id": 123,
      "provider": "local",
      "title": "Овсянка",
      "image": "https://...",
      "per100": { "calories": 372, "proteins": 12, "fats": 7, "carbs": 62 },
      "perServing": null
    }
  ],
  "pagination": { "page": 1, "pages": 10 }
}
```

---

## 2) Превью корзины (без записи)

Позволяет фронту показать пользователю итоговые ккал/Б/Ж/У до сохранения в БД.

### Маршрут
```php
Route::prefix('meals')->middleware('auth:sanctum')->group(function () {
    Route::post('preview', [\App\Http\Controllers\API\MealsApplyController::class, 'preview']);
});
```

### Тело запроса
```json
{
  "items": [
    { "product_id": 123, "grams": 150 },
    { "free_text": "Домашний смузи", "calories": 180, "proteins": 8, "fats": 2, "carbs": 35 }
  ]
}
```
- В каждом элементе ОБЯЗАТЕЛЕН один из ключей: `product_id` | `free_text`.
- Масса задаётся как `grams` (или альтернативно `servings`, если введёте порции), но не оба сразу.

### Ответ
```json
{
  "items": [
    { "ref": {"product_id": 123}, "calories": 225, "proteins": 12, "fats": 8,  "carbs": 30 },
    { "ref": {"free_text": "Домашний смузи"}, "calories": 180, "proteins": 8, "fats": 2,  "carbs": 35 }
  ],
  "totals": { "calories": 405, "proteins": 20, "fats": 10, "carbs": 65 }
}
```

### Алгоритм (пересчёт)
- Для продуктов из локальной БД опираемся на значения per 100 г:
  - `ratio = grams / 100`
  - `calories = per100.calories * ratio`, по аналогии — белки/жиры/углеводы.
- Для `free_text` — значения принимает сервер (валидация ≥ 0) и суммирует.

---

## 3) Применить корзину в ежедневный план (одна дата или множество дат)

Создаёт/дополняет реальные приёмы пищи (ежедневный план). Возвращает итог по каждой затронутой дате.

### Маршрут
```php
Route::prefix('meals')->middleware('auth:sanctum')->group(function () {
    Route::post('apply', [\App\Http\Controllers\API\MealsApplyController::class, 'apply']);
});
```

### Тело запроса
```json
{
  "apply_to": {
    "dates": ["2025-08-14"]
    // или
    // "date_range": { "from": "2025-08-18", "to": "2025-08-24" },
    // "weekdays": [1,2,3,4,5] // 1=Пн ... 7=Вс
  },
  "timezone": "Europe/Moscow",
  "type": "breakfast",              // 'breakfast'|'lunch'|'dinner'
  "strategy": "append",             // 'append'|'overwrite'|'skip'
  "items": [
    { "product_id": 123, "grams": 150 },
    { "free_text": "Кофе", "calories": 5, "proteins": 0, "fats": 0, "carbs": 1 }
  ],
  "note": "по будням",
  "idempotency_key": "uuid"
}
```

### Ответ
```json
{
  "results": [
    { "date": "2025-08-18", "meal_id": "uuid1", "status": "created",  "totals": {"calories": 230, "proteins": 12, "fats": 8, "carbs": 31} },
    { "date": "2025-08-19", "meal_id": "uuid2", "status": "updated",  "totals": {"calories": 230, "proteins": 12, "fats": 8, "carbs": 31} }
  ],
  "totals_aggregated": { "calories": 460, "proteins": 24, "fats": 16, "carbs": 62, "days_affected": 2 }
}
```

### Логика применения (ежедневный план)
- Развернуть `apply_to` в список дат по `timezone`.
- Для каждой даты:
  - найти/создать `Meal` указанного `type` (завтрак/обед/ужин) за эту дату;
  - по `strategy`:
    - `append`: добавить новые `MealItem`;
    - `overwrite`: удалить старые `MealItem` у приёма и записать новые;
    - `skip`: если у приёма уже есть `items`, пропустить дату;
  - пересчитать агрегаты приёма: ккал/Б/Ж/У;
  - записать результат и дату в массив `results`.
- Транзакция — per date (чтобы сбой не ломал все даты).
- Идемпотентность: по желанию — таблица `meal_apply_logs` с `idempotency_key` и `payload_hash` (на случай повторных кликов).

---

## 4) Пакетное добавление в существующий приём (опционально)

Для экранов редактирования уже созданного приёма.

### Маршрут
```php
Route::prefix('meals')->middleware('auth:sanctum')->group(function () {
    Route::post('{meal}/items/bulk', [\App\Http\Controllers\API\MealItemController::class, 'bulkStore']);
});
```

### Тело запроса
```json
{ "strategy": "append", "items": [ {"product_id":123, "grams":150}, {"free_text":"Яблоко", "calories":52, "proteins":0, "fats":0, "carbs":14} ] }
```

---

## Валидация (FormRequest, общие правила)
- `items`: required|array|min:1
- Каждый `item`:
  - required: один из `{ product_id | free_text }` (только локальная БД);
  - `grams` XOR `servings` (оба сразу нельзя);
  - числа: `min:0` (при необходимости верхние лимиты, например `grams <= 2000`).
- `apply_to`:
  - либо `dates[]`, либо `date_range{from,to}` [+ `weekdays[]` опционально];
- `type`: `in:breakfast,lunch,dinner`
- `strategy`: `in:append,overwrite,skip`
- `timezone`: optional (строка IANA)
- `idempotency_key`: optional (UUID)

Коды ошибок:
- 422 — валидация; 404 — не найден продукт/приём; 500 — системная.

---

## Модели и пересчёт

- `Meal` (дата, type, агрегаты calories/proteins/fats/carbs, user_id).
- `MealItem` (meal_id, product_id?, free_text?, grams?, servings?, calories, proteins, fats, carbs, timestamps).
- Пересчёт агрегатов `Meal` после добавления/изменения `MealItem` — через сервис/метод в `MealsApplyController`.

---

## Роуты для подключения (примеры вставки в routes/api.php)

```php
// 1) Поиск локальных продуктов (алиас к существующему локальному поиску)
Route::prefix('products')->middleware('auth:sanctum')->group(function () {
    Route::get('search', [\App\Http\Controllers\API\ProductSearchController::class, 'searchLocal']);
    Route::get('{id}',   [\App\Http\Controllers\API\ProductSearchController::class, 'showLocal']);
});

// 2) Превью и применение
Route::prefix('meals')->middleware('auth:sanctum')->group(function () {
    Route::post('preview', [\App\Http\Controllers\API\MealsApplyController::class, 'preview']);
    Route::post('apply',   [\App\Http\Controllers\API\MealsApplyController::class, 'apply']);
    Route::post('{meal}/items/bulk', [\App\Http\Controllers\API\MealItemController::class, 'bulkStore']);
});
```

---

## Заметки по реализации
- В `ProductSearchController::searchLocal` можно просто дернуть `LocalProductsController::searchProducts($request)` и преобразовать структуру, чтобы фронт имел стабильный контракт.
- В `MealsApplyController::preview` и `apply` всю математику выполнять на сервере (фронт только отображает результат).
- `GET /api/nutrition/daily` и `GET /api/nutrition/plan` возвращают уже актуальные данные без изменений их контрактов.

---

## Готово к внедрению
- Эти 3 эндпоинта покрывают все потребности нового модального окна: локальный поиск → превью → единичное/пакетное применение в ежедневный план.
- После добавления — фронт может работать только с локальными продуктами, как требуется.
