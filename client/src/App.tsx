import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CatalogProvider } from "@/contexts/CatalogContext";
import NotFound from "@/pages/not-found";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CatalogProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </CatalogProvider>
    </QueryClientProvider>
  );
}

export default App;
