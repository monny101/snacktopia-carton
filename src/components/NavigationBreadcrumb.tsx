import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface RouteMap {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const routeMap: RouteMap = {
  "": { label: "Home" },
  products: { label: "Products", parent: "" },
  cart: { label: "Shopping Cart", parent: "" },
  checkout: { label: "Checkout", parent: "cart" },
  "order-confirmation": { label: "Order Confirmation", parent: "checkout" },
  login: { label: "Login", parent: "" },
  register: { label: "Register", parent: "" },
  profile: { label: "My Profile", parent: "" },
  admin: { label: "Admin Dashboard", parent: "" },
  "admin/products": { label: "Manage Products", parent: "admin" },
  "admin/orders": { label: "Manage Orders", parent: "admin" },
  "admin/chat": { label: "Customer Support", parent: "admin" },
  "admin/users": { label: "Manage Users", parent: "admin" },
};

const NavigationBreadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-2 max-w-screen-xl overflow-x-auto">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {/* Home link */}
          <li>
            <Link
              to="/"
              className="text-gray-500 hover:text-blue-600 flex items-center"
            >
              <Home className="h-3.5 w-3.5 mr-1" />
              <span>Home</span>
            </Link>
          </li>

          {/* Path segments */}
          {pathSegments.map((segment, index) => {
            const isLast = index === pathSegments.length - 1;
            const path = pathSegments.slice(0, index + 1).join("/");
            const routeInfo = routeMap[path];
            const label = routeInfo?.label || segment;

            return (
              <React.Fragment key={path}>
                <li className="flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </li>
                <li>
                  {isLast ? (
                    <span className="font-medium text-gray-900">{label}</span>
                  ) : (
                    <Link
                      to={`/${path}`}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default NavigationBreadcrumb;
