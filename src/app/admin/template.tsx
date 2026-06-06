export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-admin-page-in">{children}</div>;
}
