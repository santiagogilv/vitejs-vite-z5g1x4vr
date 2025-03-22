
import { BillData } from "@/hooks/useBillStorage";

export const generateShareText = (bill: BillData): string => {
  let shareText = `📊 ${bill.title} - Bill Summary\n\n`;

  shareText += `💵 Total: ${bill.totalAmount.toFixed(2)} ${bill.currency}\n`;
  shareText += `👥 People: ${bill.users.map(u => u.name).join(', ')}\n\n`;
  
  // Add items
  shareText += `📝 Items:\n`;
  bill.items.forEach(item => {
    shareText += `- ${item.name}: ${item.price.toFixed(2)} ${bill.currency} x ${item.quantity}`;
    if (item.paidBy) {
      shareText += ` (Paid by ${item.paidBy.name})`;
    }
    shareText += `\n`;
  });
  
  // Add payment summary
  if (bill.payments && bill.payments.length > 0) {
    shareText += `\n💰 Payments:\n`;
    bill.payments.forEach(payment => {
      shareText += `- ${payment.from.name} pays ${payment.amount.toFixed(2)} ${bill.currency} to ${payment.to.name}\n`;
    });
  }

  shareText += `\nShared via Dine Share Easy App`;
  
  return shareText;
};

export const shareBill = async (bill: BillData): Promise<boolean> => {
  const shareText = generateShareText(bill);
  
  // Use Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title: bill.title,
        text: shareText
      });
      return true;
    } catch (err) {
      console.error("Error sharing:", err);
      return false;
    }
  } else {
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      return false;
    }
  }
};
