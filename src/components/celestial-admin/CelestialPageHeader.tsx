import type { AdminTab } from '../AdminPanelView';
import { routeForAdminTab } from './routes';

export function CelestialPageHeader({ activeTab }: { activeTab: AdminTab }) {
  const route = routeForAdminTab(activeTab);
  return (
    <div className="page-header">
      <h3 className="page-title">{route.title}</h3>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><span>Admin</span></li>
          <li className="breadcrumb-item"><span>{route.section}</span></li>
          <li className="breadcrumb-item active" aria-current="page">{route.title}</li>
        </ol>
      </nav>
    </div>
  );
}
