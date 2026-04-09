import { View } from 'react-native';
import { Search, Bell } from 'lucide-react-native';

type Props = {
  screen: 'home' | 'comunidades' | 'profile';
};

export default function HeaderActions({ screen }: Props) {
  if (screen === 'home') {
    return (
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <Search size={22} color="#374151" />
        <Bell size={22} color="#374151" />
      </View>
    );
  }
}
