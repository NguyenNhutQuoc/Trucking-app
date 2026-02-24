// app/index.tsx
// Entry point - redirects to the appropriate group based on auth state
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/common/Loading";

export default function Index() {
  const { isLoading, authLevel } = useAuth();

  if (isLoading) {
    return <Loading loading fullscreen message="Đang tải..." />;
  }

  if (authLevel === "full") {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
