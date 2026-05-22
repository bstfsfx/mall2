# Admin Dashboard Layout Update & Future Features

We've successfully updated the admin navigation sidebar to match your reference design.

## Changes Made

1. **Structured Navigation Categories**: 
   The sidebar is now grouped logically into clearly defined sections to make navigating the dashboard much easier:
   - **總覽**: 儀表板
   - **商品**: 商品管理, 分類管理
   - **詢價 / 會員**: 詢價單管理, 訂單管理, 會員管理
   - **內容 CMS**: Banner, 文章 / FAQ
   - **行銷**: 折扣碼, 客服訊息
   - **系統**: 系統設定, 使用者, 角色 / 權限, 操作紀錄

2. **Placeholder Pages ("Coming Soon")**:
   Instead of leaving broken links, we've created dedicated "Coming Soon" pages for all the future modules:
   - [詢價單管理](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/inquiries/page.tsx)
   - [Banner管理](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/banners/page.tsx)
   - [折扣碼](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/discounts/page.tsx)
   - [客服訊息](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/messages/page.tsx)
   - [角色 / 權限](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/roles/page.tsx)
   - [操作紀錄](file:///Users/jackychau/Documents/GitHub/Sites/mall2/src/app/(admin)/admin/logs/page.tsx)

## Validation Results

- **UI Accuracy**: The sidebar accurately reflects the requested visual grouping and uses appropriate spacing and typography for section titles.
- **Routing**: Clicking on any of the new links safely navigates to a placeholder page with a return button, preventing any 404 errors.
