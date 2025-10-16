'use client'

import { Suspense } from 'react'
import { ModuleContent } from '../[module]/page'

export default function AnalyticsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ModuleContent module="analytics" />
		</Suspense>
	)
}

