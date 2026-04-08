import type { Metadata } from 'next'

// Generic metadata layout for the (user) group, can be extended for PWA dynamically later.
export const metadata: Metadata = {
    title: 'አብደላ የመኪና እጣ | Abdela Car Lottery',
    description: 'Ethiopia\'s premier auto lottery experience. Win your dream car today!',
}

import BusinessLicenseModal from '../../components/user/BusinessLicenseModal'

// User-specific layout rules 
export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
            <BusinessLicenseModal />
            {/* 
        This is where a top-level PWA banner or dynamic headers would go
        User-only wrappers and contexts are initialized here.
      */}
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
        </div>
    )
}
