# Snell's Law — Complete Equation Reference


---

## 1. Snell's Law — Refracted Angle

When a ray crosses an interface between two media, the direction changes so that the optical path is stationary.

$$n_1 \sin\theta_1 = n_2 \sin\theta_2$$

Rearranged for the refracted angle:
$$\theta_2 = \arcsin\!\left(\frac{n_1}{n_2} \sin\theta_1\right)$$

**Total Internal Reflection (TIR) condition:**  
If $\left|\frac{n_1}{n_2}\sin\theta_1\right| > 1$, no real solution exists for $\theta_2$ — the ray is completely reflected.

---

## 2. Critical Angle

The largest incident angle for which refraction still occurs when $n_2 < n_1$:

$$\theta_c = \arcsin\!\left(\frac{n_2}{n_1}\right) \qquad (n_2 < n_1)$$

If $\theta_1 > \theta_c$ → **Total Internal Reflection** (TIR), $\theta_2 = \pi/2$.

---

## 3. Wave Speed in Each Medium

The phase velocity of light is reduced by the refractive index:

$$v_1 = \frac{c}{n_1}, \qquad v_2 = \frac{c}{n_2}$$

where $c = 2.998 \times 10^8 \; \text{m/s}$ (speed of light in vacuum).

---

## 4. Wavelength in Each Medium

The wavelength compresses or stretches in proportion to the refractive index:

$$\lambda_1 = \frac{\lambda_{\text{vac}}}{n_1}, \qquad \lambda_2 = \frac{\lambda_{\text{vac}}}{n_2}$$

The frequency $\nu$ remains constant across the interface; only the wavelength and speed change.

---

## 5. Photon Energy

Energy is conserved when the photon crosses the interface:

$$E = \frac{hc}{\lambda_{\text{vac}}} \;\;\left[\text{eV}\right]$$

For quick laboratory estimates:
$$E \;(\text{eV}) \approx \frac{1240}{\lambda_{\text{vac}} \;(\text{nm})}$$

---

## 6. Fresnel Amplitude Coefficients

At a dielectric interface, the reflected amplitude depends on polarization relative to the plane of incidence.

**s-polarized (perpendicular):**
$$r_s = \frac{n_1\cos\theta_1 \;-\; n_2\cos\theta_2}{n_1\cos\theta_1 \;+\; n_2\cos\theta_2}$$

**p-polarized (parallel):**
$$r_p = \frac{n_2\cos\theta_1 \;-\; n_1\cos\theta_2}{n_2\cos\theta_1 \;+\; n_1\cos\theta_2}$$

---

## 7. Reflectance & Transmittance (Intensity)

For unpolarised light, average the two polarization states:

$$R = \frac{1}{2}\bigl(|r_s|^2 + |r_p|^2\bigr), \qquad T = 1 - R$$

This assumes no absorption ($R + T = 1$).

---

## 8. Wave-Train Amplitudes Drawn on Canvas

To visualise the reflected and refracted rays with correct relative brightness, the peak amplitude of each wave train is scaled by the square root of the intensity ratio:

$$A_{\text{reflected}} = \sqrt{R} \cdot A_0$$
$$A_{\text{refracted}} = \sqrt{T} \cdot A_0$$

Because intensity $\propto A^2$.

---

## 9. Wave Propagation — Transverse Displacement

The instantaneous lateral displacement of the electric field along a ray in the 2-D canvas is written as:

$$y(s,t) = A \cdot \sin(k\,s - \omega\,t)$$

- $s$ — distance along the ray path (pixels)  
- $t$ — animation time (frame count)  
- $A$ — peak amplitude (pixels)  
- $\omega$ — angular frequency of the animation loop (here $\omega \equiv 0.08$ px⁻¹ per frame, arbitrary visual speed)

---

## 10. Wave Number in Pixel Space

The number of oscillations per pixel is chosen for visibility rather than physical scale:

$$k_1 = \frac{2\pi}{\lambda_1 \cdot \text{pxPerNm}}$$

with `pxPerNm = 0.12` pixels · nm⁻¹ (a visual scaling factor).

For the second medium:
$$k_2 = k_1 \cdot \frac{n_2}{n_1}$$

*Physical origin:* because $\lambda_2 = \lambda_1 \cdot \frac{n_1}{n_2}$, substituting gives $k_2 \propto \frac{1}{\lambda_2} = \frac{n_2}{n_1\lambda_1}$, so the wave compresses when entering a denser medium.

---

## 11. Phase Continuity at the Interface

The phase of the wave must match at the boundary point for all $t$:

- **Incident** &nbsp;&nbsp; $\phi_{\text{inc}} = -\omega t$
- **Refracted** $\;\;\phi_{\text{tr}} = -\omega t$ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (same phase, same $\omega$)
- **Reflected** $\;\;\phi_{\text{ref}} = -\omega t + \pi$ &emsp; ($\pi$ phase flip for reflection off a denser medium, when $n_2 > n_1$)

In canvas code:
- Incident  : `sin(k₁·s − ω·t)`
- Reflected : `sin(k₁·s − (ω·t + π))`
- Refracted : `sin(k₂·s′ − ω·t)`

---



