// src/utils/formatters.ts
/**
 * Các hàm định dạng dữ liệu
 */

/**
 * Định dạng ngày tháng (DD/MM/YYYY)
 * @param dateString Chuỗi ngày tháng ISO
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Định dạng thời gian (HH:MM)
 * @param dateString Chuỗi ngày tháng ISO
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

/**
 * Định dạng trọng lượng (kg)
 * @param weight Trọng lượng (kg)
 * @param useAbbreviation Sử dụng viết tắt (true: kg, false: kilogram)
 */
export const formatWeight = (
  weight: number,
  useAbbreviation = true,
): string => {
  if (weight >= 1000) {
    const tons = weight;
    return `${tons.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ${useAbbreviation ? "kg" : "kg"}`;
  }

  return `${weight.toLocaleString("vi-VN")} ${useAbbreviation ? "kg" : "kilogram"}`;
};

/**
 * Định dạng tiền tệ (VND)
 * @param amount Số tiền
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + " VND";
};

/**
 * Định dạng số điện thoại
 * @param phoneNumber Số điện thoại
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";

  // Loại bỏ các ký tự không phải số
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return phoneNumber;
};

/**
 * Rút gọn văn bản dài
 * @param text Văn bản cần rút gọn
 * @param maxLength Độ dài tối đa
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;

  return text.slice(0, maxLength) + "...";
};

/**
 * Chuyển đổi ngày tháng sang timestamp
 * @param dateString Chuỗi ngày tháng ISO
 */
export const dateToTimestamp = (dateString: string): number => {
  return new Date(dateString).getTime();
};

/**
 * Lấy tên ngày trong tuần
 * @param dateString Chuỗi ngày tháng ISO
 */
export const getDayOfWeek = (dateString: string): string => {
  const days = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  const date = new Date(dateString);

  return days[date.getDay()];
};

/**
 * Tính số ngày giữa hai ngày
 * @param startDate Ngày bắt đầu
 * @param endDate Ngày kết thúc
 */
export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = Math.abs(end.getTime() - start.getTime());

  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Định dạng thời gian tương đối
 * @param dateString Chuỗi ngày tháng ISO
 */
export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return "Vừa xong";
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  } else if (diffDay === 1) {
    return "Hôm qua";
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  } else {
    return formatDate(dateString);
  }
};
