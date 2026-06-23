import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagementPageRoutingModule } from './management-page-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../core/material/material.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, ManagementPageRoutingModule, SharedModule, RouterModule, MaterialModule],
})
export class ManagementPageModule {}


// Hydrating state model with the exact raw dataset from the API
// const managementNodes = ([
//   { id: 1, title: "POS Sale", titleKm: "លក់", icon: "sale", type: "page", url: "/sales", description: null, permissions: null, badge: null, sortOrder: 0, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:34.605Z", updatedAt: "2026-06-22T07:43:05.000Z", children: [] },
//   { id: 4, title: "Report", titleKm: "របាយការណ៍", icon: "report", type: "page", url: "/reports", description: null, permissions: null, badge: null, sortOrder: 1, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:35.610Z", updatedAt: "2026-06-22T07:43:22.000Z", children: [] },
//   { id: 2, title: "Sales History", titleKm: "ប្រវត្តិលក់", icon: "history", type: "page", url: "/sales-history", description: null, permissions: null, badge: null, sortOrder: 2, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:34.900Z", updatedAt: "2026-06-22T07:43:25.000Z", children: [] },
//   { id: 3, title: "Product", titleKm: "ផលិតផល", icon: "product", type: "page", url: "/products", description: null, permissions: null, badge: null, sortOrder: 3, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:35.255Z", updatedAt: "2026-06-22T07:43:25.000Z", children: [] },
//   { id: 5, title: "User", titleKm: "អ្នកប្រើ", icon: "user", type: "page", url: "/users", description: null, permissions: null, badge: null, sortOrder: 4, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:35.948Z", updatedAt: "2026-06-22T07:43:05.000Z", children: [] },
//   { id: 6, title: "Categories", titleKm: "ប្រភេទ", icon: "category", type: "page", url: "/categories", description: null, permissions: null, badge: null, sortOrder: 5, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:36.318Z", updatedAt: "2026-06-22T07:43:05.000Z", children: [] },
//   { id: 7, title: "Permission", titleKm: "ការអនុញ្ញាត", icon: "permission", type: "page", url: "/permission", description: null, permissions: null, badge: null, sortOrder: 6, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:36.675Z", updatedAt: "2026-06-22T07:43:05.000Z", children: [] },
//   {
//     id: 8, title: "Setting", titleKm: "ការកំណត់", icon: "settings", type: "menu", url: "/settings", description: null, permissions: null, badge: null, sortOrder: 7, isActive: 1, parentId: null, createdAt: "2026-06-22T04:20:36.983Z", updatedAt: "2026-06-22T07:43:05.000Z",
//     children: [
//       { id: 9, title: "page permission management", titleKm: "ការគ្រប់គ្រងការអនុញ្ញាតទំព័រ", icon: "permission", type: "page", url: "/page-permission-management", description: null, permissions: null, badge: null, sortOrder: 13, isActive: 1, parentId: 8, createdAt: "2026-06-22T04:20:37.310Z", updatedAt: "2026-06-22T07:43:05.000Z", children: [] }
//     ]
//   }
// ]);