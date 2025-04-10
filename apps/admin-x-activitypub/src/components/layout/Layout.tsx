import * as React from 'react';
import Header from './Header';
import Onboarding, {useOnboardingStatus} from './Onboarding';
import Sidebar from './Sidebar';
import {useCurrentUser} from '@tryghost/admin-x-framework/api/currentUser';
import {useFeatureFlags} from '@src/lib/feature-flags';

const Layout: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({children, ...props}) => {
    const {isEnabled} = useFeatureFlags();
    const {isOnboarded: onboardingStatus} = useOnboardingStatus();
    const {data: currentUser, isLoading} = useCurrentUser();

    const isOnboarded = isEnabled('onboarding') ? onboardingStatus : true;

    if (isLoading || !currentUser) {
        return null;
    }

    return (
        <div className='relative mx-auto flex h-screen w-full max-w-page flex-col overflow-y-auto' {...props}>
            {isOnboarded ?
                <>
                    <Header />
                    <div className='grid grid-cols-[auto_292px] items-start gap-8 px-8'>
                        <div className='z-0'>
                            {children}
                        </div>
                        <Sidebar />
                    </div>
                </> :
                <Onboarding />
            }
        </div>
    );
};

export default Layout;
