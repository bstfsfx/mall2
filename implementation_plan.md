# Update Admin Dashboard Navigation and Features

Based on the provided reference image, we need to completely restructure the Admin Dashboard sidebar to group features logically and add placeholders for several new systems.

## User Review Required

> [!IMPORTANT]
> The image introduces several complex systems (e.g., Discount Codes, Role/Permissions, Chat Messages, Audit Logs). Fully implementing the backend and database for **all** of these at once would be a massive undertaking. 
> 
> My proposal is to **first build the UI structure and create placeholder "Coming Soon" pages** for the new features so that your dashboard perfectly matches the image. We can then prioritize which feature to build the backend for next.

## Open Questions

> [!QUESTION]
> Are you okay with me creating "Coming Soon" pages for the new features (Banner, 折扣碼, 客服訊息, 角色/權限, 操作紀錄, 詢價單管理) for now? 
> Which of these new features would you like me to fully implement first after the UI is updated?

## Proposed Changes

### 1. Update Admin Navigation CSS
Modify the sidebar styles to support section headers (e.g., `總覽`, `商品`, `系統`).

#### [MODIFY] [layout.module.css](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/layout.module.css)
- Add `.navSection`, `.navSectionTitle` classes.
- Adjust spacing to accommodate the grouped list.

### 2. Refactor Admin Layout
Update the navigation rendering logic to iterate over categorized groups instead of a flat list.

#### [MODIFY] [layout.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/layout.tsx)
- Change `menuItems` to a nested structure:
  ```javascript
  const menuGroups = [
    { title: '總覽', items: [{ href: '/admin', label: '📊 儀表板' }] },
    { title: '商品', items: [{ href: '/admin/products', label: '🍰 商品管理' }, { href: '/admin/categories', label: '📁 分類管理' }] },
    // ... other groups matching the image
  ]
  ```

### 3. Create Placeholder Pages for New Features
Create basic UI pages for the newly introduced sections so the links don't lead to 404 errors.

#### [NEW] [inquiries/page.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/inquiries/page.tsx)
#### [NEW] [banners/page.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/banners/page.tsx)
#### [NEW] [discounts/page.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/discounts/page.tsx)
#### [NEW] [messages/page.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/messages/page.tsx)
#### [NEW] [roles/page.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/roles/page.tsx)
#### [NEW] [logs/page.tsx](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/logs/page.tsx)

## Verification Plan

### Manual Verification
1. Open the Admin Dashboard.
2. Verify the left sidebar perfectly matches the structure, categories, and wording of the reference image.
3. Click on the new links (e.g., "折扣碼", "操作紀錄") and ensure they load a clean "Coming Soon" placeholder page rather than a 404 error.
