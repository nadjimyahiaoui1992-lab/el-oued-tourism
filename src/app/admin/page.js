import { redirect } from "next/navigation";

export default function AdminRedirect() {
  // توجيه المستخدم مباشرة وبشكل فوري إلى صفحة الداشبورد
  redirect("/admin/dashboard");
}
