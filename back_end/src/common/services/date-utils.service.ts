import { Injectable } from '@nestjs/common';

@Injectable()
export class DateUtilsService {
  getMonthName(month: number): String {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }
  /**
   * Lấy ngày đầu tiên của tháng
   * @param date Ngày tham chiếu (mặc định là ngày hiện tại)
   * @returns Ngày đầu tiên của tháng chứa ngày tham chiếu
   */
  getFirstDayOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Lấy ngày cuối cùng của tháng
   * @param date Ngày tham chiếu (mặc định là ngày hiện tại)
   * @returns Ngày cuối cùng của tháng chứa ngày tham chiếu
   */
  getLastDayOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * Lấy khoảng thời gian của một tháng
   * @param date Ngày tham chiếu (mặc định là ngày hiện tại)
   * @returns Object chứa ngày đầu và cuối của tháng
   */
  getMonthRange(date: Date = new Date()): { firstDay: Date, lastDay: Date } {
    return {
      firstDay: this.getFirstDayOfMonth(date),
      lastDay: this.getLastDayOfMonth(date)
    };
  }

  /**
   * Lấy khoảng thời gian của tháng hiện tại
   * @returns Object chứa ngày đầu và cuối của tháng hiện tại
   */
  getCurrentMonthRange(): { firstDay: Date, lastDay: Date } {
    return this.getMonthRange(new Date());
  }

  /**
   * Lấy khoảng thời gian của một tháng cụ thể trong năm
   * @param month Tháng (0-11)
   * @param year Năm
   * @returns Object chứa ngày đầu và cuối của tháng
   */
  getSpecificMonthRange(month: number, year: number): { firstDay: Date, lastDay: Date } {
    const date = new Date(year, month, 1);
    return this.getMonthRange(date);
  }

  /**
   * Kiểm tra xem một ngày có nằm trong khoảng thời gian không
   * @param date Ngày cần kiểm tra
   * @param startDate Ngày bắt đầu của khoảng
   * @param endDate Ngày kết thúc của khoảng
   * @returns Boolean cho biết ngày có trong khoảng hay không
   */
  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Kiểm tra xem hai khoảng thời gian có giao nhau không
   * @param range1Start Ngày bắt đầu khoảng 1
   * @param range1End Ngày kết thúc khoảng 1
   * @param range2Start Ngày bắt đầu khoảng 2
   * @param range2End Ngày kết thúc khoảng 2
   * @returns Boolean cho biết hai khoảng có giao nhau không
   */
  doDateRangesOverlap(
    range1Start: Date, range1End: Date, 
    range2Start: Date, range2End: Date
  ): boolean {
    return range1Start <= range2End && range2Start <= range1End;
  }

  /**
   * Tính số ngày giữa hai ngày
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   * @returns Số ngày giữa hai ngày
   */
  getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Thêm số ngày vào một ngày cụ thể
   * @param date Ngày ban đầu
   * @param days Số ngày cần thêm
   * @returns Ngày mới
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Lấy ngày với thời gian là đầu ngày (00:00:00)
   * @param date Ngày cần xử lý
   * @returns Ngày với thời gian là đầu ngày
   */
  getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Lấy ngày với thời gian là cuối ngày (23:59:59.999)
   * @param date Ngày cần xử lý
   * @returns Ngày với thời gian là cuối ngày
   */
  getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }
}
