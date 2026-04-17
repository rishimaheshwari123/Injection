# BookingsPage.tsx Refactoring Plan

## Current Issues
- **File Size**: 2329+ lines in a single file
- **Maintainability**: All modals embedded in main component
- **Readability**: Difficult to navigate and understand
- **Reusability**: Modal logic cannot be reused

## Proposed Structure

### 1. Create Separate Modal Components

```
src/components/bookings/
├── CreateBookingModal.tsx          ✅ CREATED
├── StatusUpdateModal.tsx           (To create)
├── NotesModal.tsx                  (To create)
├── ServiceDetailModal.tsx          (To create)
├── ViewPrescriptionModal.tsx       (To create)
├── ReportUploadModal.tsx           (To create)
├── ViewReportsModal.tsx            (To create)
└── index.ts                        (Export all modals)
```

### 2. Modal Component Props Pattern

Each modal should follow this pattern:

```typescript
interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  data?: any; // Modal-specific data
}
```

### 3. Refactored BookingsPage.tsx Structure

```typescript
// Imports
import CreateBookingModal from '../../components/bookings/CreateBookingModal';
import StatusUpdateModal from '../../components/bookings/StatusUpdateModal';
import NotesModal from '../../components/bookings/NotesModal';
// ... other modals

const BookingsPage = () => {
  // State management (reduced)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  // ... other modal states
  
  // Data fetching
  useEffect(() => {
    fetchBookings();
    fetchVendors();
    fetchServices();
    fetchUsers();
  }, []);

  // Handler functions
  const handleCreateBooking = async (data: any) => {
    // Logic here
  };

  const handleStatusUpdate = async (data: any) => {
    // Logic here
  };

  // ... other handlers

  return (
    <div>
      {/* Header */}
      {/* Filters */}
      {/* Table */}
      
      {/* Modals */}
      <CreateBookingModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBooking}
        services={services}
        users={users}
      />
      
      <StatusUpdateModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusUpdate}
        booking={selectedBooking}
      />
      
      {/* ... other modals */}
    </div>
  );
};
```

## Benefits

### 1. **Improved Maintainability**
- Each modal is self-contained
- Easy to locate and fix bugs
- Clear separation of concerns

### 2. **Better Readability**
- Main component reduced from 2329 to ~500 lines
- Each modal component is 200-400 lines
- Easier to understand flow

### 3. **Enhanced Reusability**
- Modals can be used in other pages
- Consistent UI/UX across application
- Shared logic can be extracted to hooks

### 4. **Easier Testing**
- Test each modal independently
- Mock props easily
- Isolated unit tests

### 5. **Better Performance**
- Lazy load modals if needed
- Code splitting opportunities
- Reduced initial bundle size

## Implementation Steps

### Step 1: Create Modal Components (Priority Order)

1. ✅ **CreateBookingModal** - Most complex, already created
2. **StatusUpdateModal** - Simple, good starting point
3. **NotesModal** - Medium complexity
4. **ServiceDetailModal** - Simple display modal
5. **ViewPrescriptionModal** - Complex display logic
6. **ReportUploadModal** - File upload logic
7. **ViewReportsModal** - Display multiple reports

### Step 2: Extract Common Logic

Create custom hooks for shared functionality:

```typescript
// src/hooks/useBookingModals.ts
export const useBookingModals = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  // ... other modal states
  
  return {
    modals: {
      create: { show: showCreateModal, setShow: setShowCreateModal },
      status: { show: showStatusModal, setShow: setShowStatusModal },
      // ... other modals
    }
  };
};
```

### Step 3: Refactor Main Component

1. Import all modal components
2. Replace inline modals with components
3. Pass necessary props
4. Test functionality

### Step 4: Create Index File

```typescript
// src/components/bookings/index.ts
export { default as CreateBookingModal } from './CreateBookingModal';
export { default as StatusUpdateModal } from './StatusUpdateModal';
export { default as NotesModal } from './NotesModal';
export { default as ServiceDetailModal } from './ServiceDetailModal';
export { default as ViewPrescriptionModal } from './ViewPrescriptionModal';
export { default as ReportUploadModal } from './ReportUploadModal';
export { default as ViewReportsModal } from './ViewReportsModal';
```

## Modal Component Templates

### StatusUpdateModal.tsx
```typescript
interface StatusUpdateModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (status: string) => Promise<void>;
  booking: any;
}

const StatusUpdateModal = ({ show, onClose, onSubmit, booking }: StatusUpdateModalProps) => {
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(newStatus);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      {/* Modal content */}
    </div>
  );
};
```

### NotesModal.tsx
```typescript
interface NotesModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  booking: any;
}

const NotesModal = ({ show, onClose, onSubmit, booking }: NotesModalProps) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Implementation
};
```

### ServiceDetailModal.tsx
```typescript
interface ServiceDetailModalProps {
  show: boolean;
  onClose: () => void;
  service: any;
  onAddToBooking?: (service: any) => void;
}

const ServiceDetailModal = ({ show, onClose, service, onAddToBooking }: ServiceDetailModalProps) => {
  // Implementation
};
```

## File Size Comparison

### Before Refactoring
```
BookingsPage.tsx: 2329 lines
```

### After Refactoring
```
BookingsPage.tsx: ~500 lines
CreateBookingModal.tsx: ~400 lines
StatusUpdateModal.tsx: ~150 lines
NotesModal.tsx: ~200 lines
ServiceDetailModal.tsx: ~250 lines
ViewPrescriptionModal.tsx: ~350 lines
ReportUploadModal.tsx: ~250 lines
ViewReportsModal.tsx: ~300 lines
---
Total: ~2400 lines (distributed across 8 files)
```

## Next Steps

1. Create remaining modal components
2. Update BookingsPage.tsx to use modal components
3. Test all functionality
4. Create custom hooks for shared logic
5. Add TypeScript interfaces for better type safety
6. Document each component with JSDoc comments

## Testing Checklist

- [ ] Create booking modal works
- [ ] Status update modal works
- [ ] Notes modal works
- [ ] Service detail modal works
- [ ] View prescription modal works
- [ ] Report upload modal works
- [ ] View reports modal works
- [ ] All modals close properly
- [ ] Data refreshes after modal actions
- [ ] Error handling works correctly
- [ ] Loading states display properly

## Notes

- Keep modal z-index consistent (z-[60])
- Maintain consistent styling across modals
- Use same button styles and colors
- Keep form validation consistent
- Ensure accessibility (keyboard navigation, ARIA labels)
- Add loading spinners for async operations
- Show success/error toasts after actions
