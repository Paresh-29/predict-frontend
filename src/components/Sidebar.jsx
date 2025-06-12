import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { Home, TrendingUp, Brain, Menu, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const NavItem = ({ to, icon: Icon, children, isCollapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        isCollapsed && "justify-center px-2 space-x-0"
      )
    }
  >
    <Icon size={20} />
    {!isCollapsed && <span>{children}</span>}
  </NavLink>
);

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[240px] p-0 bg-background text-foreground"
        >
          <SidebarContent isCollapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background text-foreground transition-all duration-300 relative border-border",
          isCollapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 -right-3 h-6 w-6 rounded-full border border-border bg-background text-foreground shadow-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform",
              isCollapsed ? "" : "rotate-180"
            )}
          />
        </Button>
      </aside>
    </>
  );
}

function SidebarContent({ isCollapsed }) {
  return (
    <ScrollArea className="flex flex-col flex-grow">
      <div
        className={cn(
          "flex h-14 items-center border-b border-border px-3",
          isCollapsed ? "justify-center" : "px-4"
        )}
      >
        {isCollapsed ? (
          <TrendingUp className="h-6 w-6 text-primary" />
        ) : (
          <h1 className="text-xl font-semibold text-foreground">
            Stock Predictor
          </h1>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <NavItem to="/" icon={Home} isCollapsed={isCollapsed}>
          Home
        </NavItem>
        <NavItem to="/lstm" icon={TrendingUp} isCollapsed={isCollapsed}>
          LSTM
        </NavItem>
        <NavItem to="/agentic-ai" icon={Brain} isCollapsed={isCollapsed}>
          Agentic AI
        </NavItem>
      </nav>
    </ScrollArea>
  );
}
