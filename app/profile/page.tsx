'use client'

import { Suspense } from 'react'
import { ModuleContent } from '../[module]/page'

export default function ProfilePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ModuleContent module="profile" />
		</Suspense>
	)
}

