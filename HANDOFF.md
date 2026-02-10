
# Developer Handoff

## Architecture Overview

The app is a Single Page Application (SPA) built with React and Vite. It uses client-side routing (`react-router-dom`) with a hash router strategy to ensure compatibility with static hosting environments.

### Key Libraries
- **Tailwind CSS**: Utility-first styling. Configured in `tailwind.config.js` with custom colors (`primary`, `secondary`, `accent`).
- **Zustand**: Global state management. `useCartStore` persists cart data to localStorage. `useAuthStore` manages session state.
- **React Hook Form + Zod**: Robust form handling and validation.
- **Dnd-Kit**: Used for drag-and-drop reordering in Menu and Gallery admin.
- **Recharts**: Data visualization in the Admin Dashboard.

## Component Patterns

### Shared Components
Located in `src/components/shared`.
- `Button.tsx`: Supports variants, sizes, icons, and loading states.
- `Input.tsx`: Generic input wrapper with label, error message, and icon support.
- `Modal.tsx`: Accessible portal-based modal.
- `DataTable.tsx`: (In admin) Generic table with sorting, pagination, and selection.

### Admin Structure
Admin pages share a common `AdminLayout` which includes the `Sidebar` and `AdminHeader`.
Pages fetch data on mount using `useEffect` and the service layer.

## Adding New Features

### 1. Create API Service
Add functions in `src/services/api/featureName.ts`.
Always return promises. Use `supabase` client for DB operations.

Example:
```typescript
export const getItems = async () => {
  const { data, error } = await supabase.from('items').select('*');
  if (error) throw error;
  return data;
}
```

### 2. Create Page Component
Create `src/pages/admin/FeatureName.tsx`.
- Use `useState` for data and loading state.
- Use `useEffect` to fetch data.
- Use `DataTable` or custom grid for display.

### 3. Add Route
Update `src/App.tsx`:
```tsx
const FeatureName = React.lazy(() => import('./pages/admin/FeatureName'));
// ... inside Routes
<Route path="feature" element={<FeatureName />} />
```

### 4. Update Sidebar
Add item to `navItems` in `src/components/admin/Sidebar.tsx`.

## Styling Guidelines

- Use semantic HTML tags.
- Use `cn()` utility for conditional class merging.
- Prefer Tailwind utility classes over custom CSS.
- Primary color: Gold `#D4AF37`. Secondary: Navy `#1B2838`.

## Common Issues & Fixes

- **Date Handling**: All dates from Supabase are UTC strings. Use `new Date()` or `date-fns` to format for display.
- **Images**: Use `URL.createObjectURL` for immediate local preview before upload.
- **Routing**: If deploying to a subdirectory, ensure `vite.config.ts` base path is set correctly.

## Future Improvements

- Implement Server-Side Pagination for large datasets (currently client-side for mock data).
- Add specific role-based access control (RBAC) if multiple admin levels are needed.
- Implement email notifications via Supabase Edge Functions.
