# Performance Optimization Guide

## Automatic Mobile Optimizations

The mobile version automatically detects mobile devices and applies these optimizations:

### Video Processing
- **Lower Pixel Ratio**: Capped at 1.5x instead of full device pixel ratio
- **Reduced FPS**: Default 30 FPS on mobile vs 60 FPS on desktop
- **Smaller Analysis Grid**: 8x8 grid on mobile vs 16x16 on desktop
- **FPS Throttling**: Frame timing control to maintain consistent performance

### Audio Processing
- **Reduced Polyphony**: 4 voices max on mobile vs 8 on desktop
- **Shorter Reverb**: 2 second decay on mobile vs 4 seconds on desktop
- **Optimized Effects Chain**: Same quality, lower CPU usage

## Manual Performance Tuning

If experiencing lag on older devices, adjust these parameters via the controls menu (⋮):

### High Impact (Try First)
1. **Lower FPS**: Reduce to 20-24 FPS for smoother performance
2. **Reduce Shapes**: Clear shapes and add only 1-2 at a time
3. **Disable Effects**: Set these to 0:
   - Kaleidoscope
   - Color Chase
   - RGB Shift
   - Pixelate

### Medium Impact
4. **Lower Shape Complexity**: Use simpler shapes (circle, square) instead of complex ones (icosahedron, metatron)
5. **Reduce Shape Animation**: Set rotation, pulse, and color speeds to 0
6. **Disable Audio Effects**: Set to 0:
   - Reverb Mix
   - Delay Mix
   - Distortion
   - Bitcrush

### Low Impact
7. **Adjust Feedback Zoom**: Keep closer to 1.0 (less transformation = less processing)
8. **Reduce Drawing**: Avoid complex recorded drawings

## Device-Specific Tips

### Older iPhones (iPhone 7, 8)
- Use 20 FPS
- Max 1 shape at a time
- Disable kaleidoscope and color chase

### Mid-Range Android
- Use 24-30 FPS
- Max 2 shapes
- Minimal effects

### Tablets (iPad, Android tablets)
- Can handle default settings
- Try 45 FPS for smoother visuals

### Modern Phones (iPhone 12+, flagship Android)
- Default settings work well
- Can increase FPS to 45-60 if desired

## Performance Indicators

**Good Performance:**
- Smooth visual feedback
- No audio crackling
- Responsive touch gestures

**Poor Performance:**
- Choppy/stuttering visuals
- Audio glitches or dropouts
- Delayed touch response

If experiencing poor performance, follow the tuning steps above in order.

## Technical Details

The optimizations work by:
- Reducing canvas resolution (fewer pixels to process)
- Limiting frame rate (fewer renders per second)
- Reducing polyphony (fewer simultaneous audio voices)
- Smaller analysis grid (faster motion detection)
- Capping effect complexity (less pixel manipulation)

These changes maintain visual and audio quality while significantly reducing CPU/GPU load.
