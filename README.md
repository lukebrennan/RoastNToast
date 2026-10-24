# Roast ’N Toast

Website for Roast ’N Toast, a breakfast & roast dinner delivery service in Prescot & Knowsley.
*The best brekky in Prekky!*

Plain static HTML/CSS/JS, so no build step. Works on GitHub Pages as is.

## Pages
- `index.html`: landing page
- `menu.html`: full menu (breakfasts, toasties, extras, roasts, delivery)
- `under-construction.html`: target for nav links that don't have pages yet (Delivery Area, About Us, Contact)
- `404.html`: GitHub Pages not-found page (uses `/RoastNToast/` absolute paths)

## Content notes
- Breakfast, toastie, extras prices and the £3 delivery charge are taken from the client's own Facebook/Instagram menu posts.
- **Roast dinners are placeholder content.** Dish names and descriptions are temporary and prices show "Ask us". Search for `PLACEHOLDER` in `index.html` and `menu.html`.
- Food photos were supplied for the project (breakfast and roast dinner sets).

## Local preview
```
python3 -m http.server 8765
```
