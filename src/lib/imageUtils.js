export function decodeImageUrls(input) {
  if (!input) return null;
  
  try {
    // 1. إذا كان النص يبدأ بـ [ فهو JSON مصفوفة، نقوم بتحويله
    if (typeof input === 'string' && input.startsWith('[')) {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    }
    
    // 2. تنظيف أي أقواس أو علامات تنصيص زائدة في حال وجودها
    const cleaned = input.toString().replace(/[\[\]"]/g, '').trim();
    return cleaned;
  } catch (e) {
    // 3. في حال فشل التحويل، نرجع النص كما هو (بعد التنظيف)
    return input.toString().replace(/[\[\]"]/g, '').trim();
  }
}
