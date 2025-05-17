import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { AuthUser } from "@/types"
import ChatsContainer from "../chat/chats-container"
import { Command } from "lucide-react"
  
  export function AppSidebar({ user }: { user: AuthUser }) {
    return (
      <Sidebar>
        <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <ChatsContainer />
          </SidebarGroupContent>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter >
            <NavUser user={user}/>
        </SidebarFooter>
      </Sidebar>
    )
  }
  