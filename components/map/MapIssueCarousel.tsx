import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { CivicIssue } from '@/types/issue';
import { CivicIssueCard } from '../cards/CivicIssueCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 36;
const CARD_MARGIN = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

export interface MapIssueCarouselRef {
  scrollToIssue: (issueId: string) => void;
  scrollToIndex: (index: number) => void;
}

interface MapIssueCarouselProps {
  issues: CivicIssue[];
  userCoords?: { latitude: number; longitude: number } | null;
  onPressIssue: (issueId: string) => void;
  onActiveIssueChange?: (issue: CivicIssue) => void;
}

export const MapIssueCarousel = forwardRef<MapIssueCarouselRef, MapIssueCarouselProps>(
  ({ issues, userCoords, onPressIssue, onActiveIssueChange }, ref) => {
    const flatListRef = useRef<FlatList<CivicIssue>>(null);

    useImperativeHandle(ref, () => ({
      scrollToIssue: (issueId: string) => {
        const index = issues.findIndex((i) => i.id === issueId);
        if (index !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }
      },
      scrollToIndex: (index: number) => {
        if (index >= 0 && index < issues.length && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }
      },
    }));

    const onViewableItemsChanged = useCallback(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].item) {
          const activeItem = viewableItems[0].item as CivicIssue;
          if (onActiveIssueChange) {
            onActiveIssueChange(activeItem);
          }
        }
      },
      [onActiveIssueChange]
    );

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 60,
    }).current;

    if (!issues || issues.length === 0) {
      return null;
    }

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={issues}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.contentContainer}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <CivicIssueCard
                issue={item}
                userCoords={userCoords}
                onPress={onPressIssue}
                variant="mapOverlay"
              />
            </View>
          )}
          getItemLayout={(_, index) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
          })}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 84, // Directly above the floating bottom tab bar
    zIndex: 90,
  },
  contentContainer: {
    paddingHorizontal: 18,
    gap: CARD_MARGIN,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
});
