import { Matrix4, Quaternion, Spherical, Vector3 } from 'three';

/**
 * An easing function that matches the Material Design motion curve.
 *
 * @param t The interpolation factor between 0 and 1
 * @returns The eased interpolation factor
 */
export function materialEase(t: number): number {
  // cubic-bezier(0.4, 0.0, 0.2, 1)
  const a = Math.pow(
    8 * Math.sqrt(400 * t * t - 225 * t + 37) + 5 * (32 * t - 9),
    1 / 3,
  );
  const x = (a * a + 3 * a - 7) / (8 * a);
  return -x * x * (2 * x - 3);
}

const ORIGIN = new Vector3(0, 0, 0);
const UP = new Vector3(0, 1, 0);

/**
 * Converts spherical coordinates to a quaternion rotation that would make an object face towards
 * the origin (0,0,0) from the given spherical position (e.g. a camera looking at the center point
 * from the specified angle and distance).
 *
 * @param spherical Spherical coordinates defining the position
 * @returns Quaternion representing the rotation to face the origin
 */
export function sphericalToQuaternion(spherical: Spherical): Quaternion {
  return new Quaternion().setFromRotationMatrix(
    new Matrix4().lookAt(new Vector3().setFromSpherical(spherical), ORIGIN, UP),
  );
}

/**
 * Smoothly interpolates between two spherical coordinates, taking the shortest path around the
 * sphere while also interpolating the radius.
 *
 * @param start Starting spherical coordinates
 * @param end Ending spherical coordinates
 * @param t Interpolation factor between 0 and 1
 * @returns Interpolated spherical coordinates
 */
export function lerpSpherical(
  start: Spherical,
  end: Spherical,
  t: number,
): Spherical {
  // Interpolate two spherical coordinates using a Quaternion to ensure that only the shortest path
  // is taken
  const startRotation = sphericalToQuaternion(start);
  const endRotation = sphericalToQuaternion(end);
  startRotation.slerp(endRotation, t);

  // Calculated the lerped radius
  const radius = start.radius + t * (end.radius - start.radius);

  // Convert the lerped rotation back to spherical coordinates
  return new Spherical().setFromVector3(
    new Vector3(0, 0, radius).applyQuaternion(startRotation),
  );
}
