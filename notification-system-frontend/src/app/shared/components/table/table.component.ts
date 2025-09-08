import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { Message } from '../../interface/message';
import { MatIconModule } from '@angular/material/icon';
import { StatusStylePipe } from '../../pipes/status-style.pipe';


@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, DatePipe, MatIconModule, StatusStylePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  displayedColumns: string[] = ['demo-id', 'demo-message', 'demo-status', 'demo-timestamp'];
   @Input() dataSource: Message[] = [];
}
