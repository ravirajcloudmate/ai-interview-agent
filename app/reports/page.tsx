'use client'

import { Suspense } from 'react'
import { ModuleContent } from '../[module]/page'

export default function ReportsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ModuleContent module="reports" />
		</Suspense>
	)
}

