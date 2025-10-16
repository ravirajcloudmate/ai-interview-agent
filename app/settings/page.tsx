'use client'

import { Suspense } from 'react'
import { ModuleContent } from '../[module]/page'

export default function SettingsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ModuleContent module="settings" />
		</Suspense>
	)
}

