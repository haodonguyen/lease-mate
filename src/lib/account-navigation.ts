export function getAccountActionHref({
  isAuthenticated,
  targetPath,
}: {
  isAuthenticated: boolean;
  targetPath: string;
}) {
  return isAuthenticated ? targetPath : `/login?next=${targetPath}`;
}
