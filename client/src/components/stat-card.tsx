import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({
	title,
	value,
	icon,
	variant = 'primary',
}: {
	title: string;
	value: string;
	icon?: JSX.Element;
	variant?: 'primary' | 'secondary';
}) {
	return (
		<Card className={variant === 'secondary' ? 'bg-muted/50' : ''}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold overflow-hidden truncate">
					{value}
				</div>
			</CardContent>
		</Card>
	);
}
