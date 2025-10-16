'use client'

import { Suspense } from 'react'
import { ModuleContent } from '../[module]/page'

export default function DashboardPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ModuleContent module="dashboard" />
		</Suspense>
	)
}


