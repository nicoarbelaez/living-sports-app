import { createContext, useContext } from 'react';

interface CommunityListContextValue {
  joinedIds: Set<string>;
  onJoin: (groupId: string) => void;
  joiningId: string | null;
  ownedGroupId?: string;
}

const CommunityListContext = createContext<CommunityListContextValue>({
  joinedIds: new Set(),
  onJoin: () => {},
  joiningId: null,
  ownedGroupId: undefined,
});

export const useCommunityListContext = () => useContext(CommunityListContext);

export default CommunityListContext;
