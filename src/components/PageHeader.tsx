interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, description, children }: PageHeaderProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {children && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{children}</div>}
  </div>
);

export default PageHeader;
