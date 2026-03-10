'use client';

import { Nav, Footer } from '@/components/shared';
import { PuzzleHero } from '@/components/advertise/puzzle/PuzzleHero';
import { CreateSection } from '@/components/advertise/sections/CreateSection';
import { SelectSection } from '@/components/advertise/sections/SelectSection';
import { AmplifySection } from '@/components/advertise/sections/AmplifySection';
import { ValidateSection } from '@/components/advertise/sections/ValidateSection';
import { PowerModeStrip } from '@/components/advertise/sections/PowerModeStrip';

export default function AdvertiseLanding() {
  return (
    <div className="min-h-screen">
      <Nav variant="advertise" />
      <PuzzleHero />
      <CreateSection />
      <SelectSection />
      <AmplifySection />
      <ValidateSection />
      <PowerModeStrip />
      <Footer />
    </div>
  );
}
