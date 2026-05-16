# Electronic Properties of Materials — Part III: Optical Properties of Materials

*Extracted from: Electronic Properties of Materials (4th Ed.), Rolf E. Hummel*

*Source: Springer, 2011*

============================================================



--- Page 228 ---

PART III
OPTICAL PROPERTIES
OF MATERIALS
Nature and nature’s laws lay hid in night;
God said “Let Newton be” and all was light.
Alexander Pope, English poet.



--- Page 229 ---

CHAPTER 10
The Optical Constants
10.1. Introduction
The most apparent properties of metals, their luster and their color, have
been known to mankind since metals were known. Because of these pro-
perties, metals were already used in ancient times for mirrors and jewelry.
The color was utilized 4000 years ago by the ancient Chinese as a guide
to determine the composition of the melt of copper alloys: the hue of a
preliminary cast indicated whether the melt, from which bells or mirrors
were to be made, already had the right tin content.
The German poet Goethe was probably the ﬁrst one who explicitly
spelled out 200 years ago in his Treatise on Color that color is not an
absolute property of matter (such as the resistivity), but requires a living
being for its perception and description. Applying Goethe’s ﬁndings, it was
possible to explain qualitatively the color of, say, gold in simple terms.
Goethe wrote: “If the color blue is removed from the spectrum, then blue,
violet, and green are missing and red and yellow remain.” Thin gold ﬁlms
are bluish–green when viewed in transmission. These colors are missing in
reﬂection. Consequently, gold appears reddish–yellow.
This chapter treats the optical properties from a completely different
point of view. Measurable quantities such as the index of refraction or the
reﬂectivity and their spectral variations are used to characterize materials.
In doing so, the term “color” will almost completely disappear from our
vocabulary. Instead, it will be postulated that the interactions of light with
the valence electrons of a material are responsible for the optical properties.
As in previous chapters, where an understanding of the electrical properties
R.E. Hummel, Electronic Properties of Materials 4th edition,
DOI 10.1007/978-1-4419-8164-6_10, # Springer ScienceþBusiness Media, LLC 2011
215



--- Page 230 ---

was attempted, an atomistic model and later a quantum mechanical treat-
ment will be employed. Thus, the electron theory of metals, as introduced in
the ﬁrst six chapters, will serve as a foundation.
Light comprises only an extremely small segment of the entire electro-
magnetic spectrum, which ranges from radio waves, via microwaves, infra-
red, visible, ultraviolet, and X-rays, to g rays, as depicted in Fig. 10.1. Many
of the considerations that will be advanced in this chapter are therefore also
valid for other wavelength ranges, e.g., for radio waves or X-rays.
At the beginning of this century the study of the interactions of light with
matter (black body radiation, etc.) laid the foundations for quantum theory.
Today, optical methods are among the most important tools for elucidating
the electron structure of matter. Most recently, a number of optical devices,
such as lasers, photodetectors, waveguides, light-emitting diodes, ﬂat-panel
displays, etc., have gained considerable technological importance. They are
used in communication, ﬁber optics, medical diagnostics, night viewing,
solar applications, optical computing, or for other optoelectronic purposes.
Traditional utilizations of optical materials for windows, antireﬂection coat-
ings, lenses, mirrors, etc., should be likewise mentioned. All taken, it is well
justiﬁed to spend a major part of this book on the optical properties of
materials.
Before we start our discourse, we need to deﬁne the optical constants.
We make use of some elements of physics.
Figure 10.1. The spectrum of electromagnetic radiation. Note the small segment of this
spectrum that is visible to human eyes.
216
III. Optical Properties of Materials



--- Page 231 ---

10.2. Index of Refraction, n
When light passes from an optically “thin” into an optically dense medium,
one observes that in the dense medium, the angle of refraction, b, (i.e., the
angle between the refracted light beam and a line perpendicular to the
surface) is generally smaller than the angle of incidence, a see Fig. 10.2.
This well-known phenomenon is used for the deﬁnition of the refractive
power of a material and is called Snell’s law,
sin a
sin b ¼ nmed
nvac
¼ n:
(10.1)
Commonly, the index of refraction for vacuum, nvac, is arbitrarily set to be
unity. The refraction is caused by the different velocities, c, of the light in
the two media,
sin a
sin b ¼ cvac
cmed
:
(10.2)
Thus, if light passes from vacuum into a medium, we ﬁnd
n ¼ cvac
cmed
¼ c
v :
(10.3)
The magnitude of the refractive index depends on the wavelength of the
incident light. This property is called dispersion. In metals, the index of
refraction varies, in addition, with the angle of incidence. This is particularly
true when n is small.
As can be seen in Table 10.1, the index of refraction is not always larger
than 1 as for example, for metals. Likewise, for X-rays, n can be smaller than 1.
In summary, when light passes from vacuum into a medium, its velocity
as well as its wavelength, l, generally decrease in order to keep the
frequency, and thus, the energy, constant.
Figure 10.2. Refraction of a light beam when traversing the boundary from an optically thin
medium into an optically denser medium.
10. The Optical Constants
217



--- Page 232 ---

10.3. Damping Constant, k
Metals damp the intensity of light in a relatively short distance. Thus, to
characterize the optical properties of metals, an additional materials con-
stant is needed.
We make use of the electromagnetic wave equation, which mathemati-
cally describes the propagation of light in a medium. The derivation of this
wave equation from the well-known Maxwell equations does not further our
understanding of the optical properties. (The interested reader can ﬁnd the
derivation in specialized texts.1)
For simpliﬁcation, we consider a plane-polarized wave that propagates
along the positive z-axis and which vibrates in the x-direction (Fig. 10.3).
We neglect possible magnetic effects. For this special case, the electromag-
netic wave equation reads2
c2 @2E x
@z2 ¼ e @2E x
@t2 þ s
e0
@E x
@t ;
(10.4)
Table 10.1. Optical Constants for Some Materials (l ¼ 600 nm).
n
k
W (nm)
R%b
Metals
Copper
0.14
3.35
14.2
95.6
Silver
0.05
4.09
11.7
98.9
Gold
0.21
3.24
14.7
92.9
Aluminum
0.97
6.0
7.9
90.3
Ceramics
Silica glass (Vycor)
1.46
a
3.50
Soda-lime glass
1.51
a
4.13
Dense ﬂint glass
1.75
a
7.44
Quartz
1.55
a
3  108
4.65
Al2O3
1.76
a
7.58
Polymers
Polyethylene
1.51
a
4.13
Polystyrene
1.60
a
5.32
Polytetraﬂuoroethylene
1.35
a
2.22
Semiconductors
Silicon
3.94
0.025
1,910
35.42
GaAs
3.91
0.228
209
35.26
aThe damping constant for dielectrics is about 107.
bThe reﬂection is considered to have occurred on one reﬂecting surface only.
1For instance: R.E. Hummel, Optische Eigenschaften von Metallen und Legierungen, Springer-
Verlag, Berlin (1971).
2See also Appendix 1.
218
III. Optical Properties of Materials



--- Page 233 ---

where E x is the x-component of the electric ﬁeld strength,3 e is the dielectric
constant,4 s is the (a.c.) conductivity and e0 is a constant, called the per-
mittivity of empty space (see Appendix 4). The solution to (10.4) is com-
monly achieved by using the following trial solution:
E x ¼ E 0 exp io t  zn
c


h
i
;
(10.5)
where E 0 is the maximal value of the electric ﬁeld strength and o ¼ 2pn is
the angular frequency. Differentiating (10.5) once with respect to time, and
twice with respect to time and z, and inserting these values into (10.4) yields
^n2 ¼ e  s
e0o i ¼ e 
s
2pe0n i:
(10.6)
Equation (10.6) leads to an important result: The index of refraction is
generally a complex number, as inspection of the right-hand side of (10.6)
indicates. We denote for clarity the complex index of refraction by ^n. As is
true for all complex quantities, the complex index of refraction consists of a
real and an imaginary part,
^n ¼ n1  in2:
(10.7)
In the literature, the imaginary part of the index of refraction, n2, is often
denoted by “k” and (10.7) is then written as
^n ¼ n  ik:
(10.8)
Figure 10.3. Plane-polarized wave which propagates in the positive z-direction and vibrates
in the x-direction.
3We use for the electric ﬁeld strength the symbol E to distinguish it from the energy.
4See Section 9.5.
10. The Optical Constants
219



--- Page 234 ---

We will call n2 or k the damping constant. (In some books n2 or k is
named the absorption constant. We will not follow this practice because
the latter term is extremely misleading. Other authors call k the attenuation
index or the extinction coefﬁcient, which we will not use either in this
context.) Values for k for some materials are given in Table 10.1.
Squaring (10.8) yields, together with (10.6),
^n2 ¼ n2  k2  2nki ¼ e 
s
2pe0n i:
(10.9)
Equating individually the real and imaginary parts of (10.9) yields two
important relations between electrical and optical constants,
e ¼ n2  k2;
(10.10)
s ¼ 4pe0nkn:
(10.11)
Let us return to (10.9). The right-hand side is the difference between two
dielectric constants (a real one and an imaginary one). Thus, the left side
must be a dielectric constant too, and (10.9) may be rewritten as
^n2 ¼ n2  k2  2nik  ^e ¼ e1  ie2:
(10.12)
Equating individually the real and imaginary parts in (10.12) yields
e1 ¼ n2  k2
(10.13)
and (with (10.11))
e2 ¼ 2nk ¼
s
2pe0n :
(10.14)
Similarly as above, e1 and e2 are called the real and the imaginary parts
of the complex dielectric constant, ^e, respectively. (e1 in (10.13) is identical
to e in (10.10).) e2 is often called the absorption product or, brieﬂy, the
absorption.
We consider a special case: For insulators (s  0) it follows from (10.11)
that k  0 (see also Table 10.1). Then (10.10) reduces to e ¼ n2 (Maxwell
relation).
From (10.10), (10.11), (10.13), and (10.14) one obtains
n2 ¼ 1
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2 þ
s
2pe0n

2
s
þ e
0
@
1
A ¼ 1
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
q
þ e1


;
(10.15)
k2 ¼ 1
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2 þ
s
2pe0n

2
s
 e
0
@
1
A ¼ 1
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
q
 e1


:
(10.16)
220
III. Optical Properties of Materials



--- Page 235 ---

It should be emphasized that (10.10)–(10.16) are only valid if e, s, n, and k
are measured at the same wavelength, because these “constants” are wave-
length dependent. For small frequencies, however, the d.c. values for e and
s can be used with good approximation, as will be shown later. Finally, it
should be noted that the above equations are only valid for optically
isotropic media; otherwise e becomes a tensor.
We return now to (10.5) in which we replace the index of refraction by
the complex index of refraction (10.8). This yields
E x ¼ E 0 exp io t  z n  ik
ð
Þ
c




;
(10.17)
which may be rewritten to read
E x ¼ E 0 exp  ok
c z


|ﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ}
Damped amplitude
 exp io t  zn
c


h
i
|ﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ}
Undamped wave
:
(10.18)
Equation (10.18) is now the complete solution of the wave equation (10.4).
It represents a damped wave and expresses that in matter the amplitude
decreases exponentially with increasing z (Fig. 10.4). The constant k deter-
mines how much the amplitude decreases, i.e., k expresses the degree of
damping of the light wave. We understand now why k is termed the damping
constant.
The result which we just obtained is well known to electrical engineers.
They observe that at high frequencies the electromagnetic waves are con-
ducted only on the outer surface of a wire. They call this phenomenon the
(normal) skin effect.
Figure 10.4. Modulated light wave. The amplitude decreases exponentially in an optically
dense material. The decrease is particularly strong in metals, but less intense in dielectric
materials, such as glass.
10. The Optical Constants
221



--- Page 236 ---

10.4. Characteristic Penetration Depth, W,
and Absorbance, a
The ﬁeld strength, E , is hard to measure. Thus, the intensity, I, which can be
measured effortlessly with light sensitive devices (such as a photodetector,
see Section 8.7.6) is commonly used. The intensity equals the square of the
ﬁeld strength. Thus, the damping term in (10.18) may be written as
I ¼ E 2 ¼ I0 exp  2ok
c z


:
(10.19)
We deﬁne a characteristic penetration depth, W, as that distance at which
the intensity of the light wave, which travels through a material, has
decreased to 1/e or 37% of its original value, i.e., when
I
I0
¼ 1
e ¼ e1:
(10.20)
This deﬁnition yields, in conjunction with (10.19),
z ¼ W ¼
c
2ok ¼
c
4pnk ¼ l
4pk :
(10.21)
Table 10.1 presents values for k and W for some materials obtained by using
light having l ¼ 600 nm.
The inverse of W is called the absorbance or sometimes the (exponen-
tial) attenuation, which is, by making use of (10.21), (10.14), and (10.11),
given by,
a ¼ 4pk
l ¼ 2pe2
ln ¼
s
nce0
¼ 2ok
c :
(10.22)
Its unit is a reciprocal length, for example, cm1. It should be emphasized
that, as already deﬁned in equation (10.14)
e2 ¼ 2nk
is called the absorption which is unitless. In other words, absorbance and
absorption are not the same quantities. In Section 12.2 we will deepen our
understanding concerning the absorption of light (that is, light quanta or
photons) by explaining that if photons are interacting with matter they may
be absorbed by electrons, then transfer their energy to them and, as a
consequence, are excited into a higher, allowed energy state.
The energy loss per unit length (given for example in decibels, dB, per
centimeter) is obtained by multiplying the absorbance, a, with 4.34, see
Problem 13.6. (1 dB ¼ 10 log I/I0.)
*In analytical (spectroscopic) chemistry which mostly deals with dilute
liquids, a is called the absorption coefﬁcient. Combining equation (10.19)
with (10.22) yields
222
III. Optical Properties of Materials



--- Page 237 ---

I=Io ¼ exp ð2okz=cÞ ¼ exp ðazÞ;
(10.23)
where I and Io are, as above, the transmitted and the incident light inten-
sities, respectively. Equation (10.23) is known by the name Beer–Lambert
(or Lambert– Beer–Bouguer) law. (It should be noted, however, that not all
incident light is transferred into other energy forms e.g. heat, but instead,
may be reﬂected, scattered, or as just mentioned, transmitted). Taking the
natural logarithm of (10.23) yields
 ln I=Io ¼ az ¼ Al;
(10.24)
where Al is called the (wavelength-dependent) optical density or, unfortu-
nately also absorbance. The variable z is, as above, the path length which
the light travels through the material. To confuse the matter even further,
analytical chemists often replace the natural logarithm, ln, by the common
(base 10) logarithm which introduces a multiplication factor. Further, che-
mists relate a to the product of the molar absorptivity of the substance and
to its concentration in the solvent. This means that Al is, within certain
limits, linearly related to the concentration. However, the Beer–Lambert law
breaks down for high concentrations, particularly when the substance is
highly scattering.
10.5. Reﬂectivity, R, and Transmittance, T
Metals are characterized by a large reﬂectivity. This stems from the fact that
light penetrates a metal only a short distance, as shown in Fig. 10.4 and
Table 10.1. Thus, only a small part of the impinging energy is converted into
heat. The major part of the energy is reﬂected (in some cases close to 99%,
see Table 10.1). In contrast to this, visible light penetrates into glass much
farther than into metals, i.e., approximately seven orders of magnitude more,
see Table 10.1. As a consequence, very little light is reﬂected by glass.
Nevertheless, a piece of glass about one or two meters thick eventually
dissipates a substantial part of the impinging light into heat. (In practical
applications, one does not observe this large reduction in light intensity
because windows are as a rule only a few millimeters thick.) It should be
noted that typical window panes reﬂect the light on the front as well as on
the back surface.
The ratio between the reﬂected intensity, IR, and the incoming intensity,
I0, of the light serves as a deﬁnition for the reﬂectivity:
R ¼ IR
I0
:
(10.25)
Quite similarly, one deﬁnes the ratio between the transmitted intensity, IT,
and the impinging light intensity as the transmissivity, or transmittance:
10. The Optical Constants
223



--- Page 238 ---

T ¼ IT
I0
:
(10.26)
Experiments have shown that for insulators, R depends solely on the index
of refraction. For perpendicular incidence one ﬁnds
R ¼ n  1
ð
Þ2
n þ 1
ð
Þ2 :
(10.27)
This equation can also be derived from the Maxwell equations.
We know already that n is generally a complex quantity. By deﬁnition,
however, R has to remain real. Thus, the modulus of R becomes
R ¼ ^n  1
^n þ 1
2
;
(10.28)
which yields
R ¼ n  ik  1
ð
Þ
n  ik þ 1
ð
Þ  n þ ik  1
ð
Þ
n þ ik þ 1
ð
Þ ¼ n  1
ð
Þ2 þ k2
n þ 1
ð
Þ2 þ k2
(10.29)
(Beer equation). The reﬂectivity is a unitless materials constant and is often
given in percent of the incoming light (see Table 10.1). R is, like the index of
refraction, a function of the wavelength of the light.
The reﬂectivity is also a function of e1 and e2. We shall derive this
relationship by performing a few transformations. Equation (10.29) is
rewritten as
R ¼ n2 þ k2 þ 1  2n
n2 þ k2 þ 1 þ 2n ;
(10.30)
ð1Þ n2 þ k2 ¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
n2 þ k2
ð
Þ2
q
¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
n4 þ 2n2k2 þ k4
p
¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
n4  2n2k2 þ k4 þ 4n2k2
p
¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
n2  k2
ð
Þ2 þ 4n2k2
q
¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
q
;
(10.31)
ð2Þ 2n ¼
ﬃﬃﬃﬃﬃﬃﬃ
4n2
p
¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
2 n2 þ k2 þ n2  k2
ð
Þ
p
¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
q
þ e1


s
: (10.32)
Inserting (10.31) and (10.32) into (10.30) provides
R ¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
p
þ 1 
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
p
þ e1


r
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
p
þ 1 þ
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2
1 þ e2
2
p
þ e1


r
:
(10.33)
224
III. Optical Properties of Materials



--- Page 239 ---

10.6. Hagen–Rubens Relation
Our next task is to ﬁnd a relationship between reﬂectivity and conductivity.
For small frequencies (i.e., n < 1013 s1) the ratio s/2pe0n for metals is very
large, that is, s/2pe0  1017 s1. With e  10 we obtain
s
2pe0n  1017
1013  e:
(10.34)
Then (10.15) and (10.16) reduce to
n2 
s
2pe0n  k2:
(10.35)
The reﬂectivity may now be rewritten by combining the slightly modiﬁed
equation (10.30) with (10.35) to read
R ¼ n2 þ 2n þ 1 þ k2  4n
n2 þ 2n þ 1 þ k2
¼ 1 
4n
2n2 þ 2n þ 1 :
(10.36)
If 2n + 1 is neglected as small compared to 2n2 (which can be done only for
small frequencies for which n is much larger than 1), then (10.36) reduces by
using (10.35) to
R ¼ 1  2
n ¼ 1  4
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
n
s pe0
r
:
(10.37)
Finally, we set s ¼ s0 (d.c. conductivity) which is again only permissible
for small frequencies, i.e., in the infrared region of the spectrum. This yields
the Hagen–Rubens relation,
R ¼ 1  4
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
n
s0
pe0
r
;
(10.38)
which states that in the infrared (IR) region metals with large electrical
conductivity are good reﬂectors. This equation was found empirically by
Hagen and Rubens from reﬂectivity measurements in the IR and was
derived theoretically by Drude. As stated above, the Hagen–Rubens relation
is only valid at frequencies below 1013 s1 or, equivalently, at wavelengths
larger than about 30 mm.
Problems
1. Complete the intermediate steps between (10.5) and (10.6).
2. Calculate the conductivity from the index of refraction and the damping constant for
copper (0.14 and 3.35, respectively; measurement at room temperature and l ¼ 0.6 mm).
10. The Optical Constants
225



--- Page 240 ---

Compare your result with the conductivity of copper (see Appendix 4). You will notice a
difference between these conductivities by several orders of magnitude. Why? (Compare
only the same units!)
3. Express n and k in terms of e and s (or e1 and e2) by using e ¼ n2  k2 and s ¼ 4pe0nkn.
(Compare with (10.15) and (10.16).)
4. The intensity of Na light passing through a gold ﬁlm was measured to be about 15% of
the incoming light. What is the thickness of the gold ﬁlm? (l ¼ 589 nm; k ¼ 3.2.
Note: I ¼ E 2.)
5. Calculate the reﬂectivity of silver and compare it with the reﬂectivity of ﬂint glass
(n ¼ 1.59). Use l ¼ 0.6 mm.
6. Calculate the characteristic penetration depth in aluminum for Na light (l ¼ 589 nm;
k ¼ 6).
7. Derive the Hagen–Rubens relation from (10.33). (Hint: In the IR region e2
2  e2
1 can be
used. Justify this approximation.)
8. The transmissivity of a piece of glass of thickness d ¼ 1 cm was measured at l ¼ 589 nm
to be 89%. What would the transmissivity of this glass be if the thickness were reduced to
0.5 cm? (Note: Neglect the reﬂectance of the glass.)
226
III. Optical Properties of Materials



--- Page 241 ---

CHAPTER 11
Atomistic Theory of the Optical Properties
11.1. Survey
In the preceding chapter, the optical constants and their relationship to
electrical constants were introduced by employing the “continuum theory.”
The continuum theory considers only macroscopic quantities and interre-
lates experimental data. No assumptions are made about the structure of
matter when formulating equations. Thus, the conclusions which have been
drawn from the empirical laws in Chapter 10 should have general validity as
long as nothing is neglected in a given calculation. The derivation of the
Hagen–Rubens equation has served as an illustrative example for this.
The validity of equations derived from the continuum theory is, however,
often limited to frequencies for which the atomistic structure of solids does
not play a major role. Experience shows that the atomistic structure does not
need to be considered in the far infrared (IR) region. Thus, the Hagen–Rubens
equation reproduces the experimental results of metals in the far IR quite well.
It has been found, however, that proceeding to higher frequencies (i.e., in the
near IR and visible spectrum), the experimentally observed reﬂectivity of
metals decreases faster than predicted by the Hagen–Rubens equation
(Fig. 11.1(a)). For the visible and near IR region an atomistic model needs
to be considered to explain the optical behavior of metals. Drude did this
important step at the turn of the 20th century. He postulated that some
electrons in a metal can be considered to be free, i.e., they can be separated
from their respective nuclei. He further assumed that the free electrons can be
accelerated by an external electric ﬁeld. This preliminary Drude model was
reﬁned by considering that the moving electrons collide with certain metal
atoms in a nonideal lattice.
R.E. Hummel, Electronic Properties of Materials 4th edition,
DOI 10.1007/978-1-4419-8164-6_11, # Springer ScienceþBusiness Media, LLC 2011
227



--- Page 242 ---

The free electrons are thought to perform periodic motions in the alter-
nating electric ﬁeld of the light. These vibrations are restrained by the
abovementioned interactions of the electrons with the atoms of a nonideal
lattice. Thus, a friction force is introduced, which takes this interaction into
consideration. The calculation of the frequency dependence of the optical
constants is accomplished by using the well-known equations for vibrations,
whereby the interactions of electrons with atoms are taken into account by a
damping term which is assumed to be proportional to the velocity of the
electrons. The free electron theory describes, to a certain degree, the disper-
sion of the optical constants of metals quite well. This is schematically
shown in Fig. 11.1(a), in which the spectral dependence of the reﬂectivity
is plotted for a speciﬁc case. The Hagen–Rubens relation reproduces the
Figure 11.1. Schematic frequency dependence of the reﬂectivity of (a) metals, (b) dielec-
trics, experimentally (solid line) and according to three models.
228
III. Optical Properties of Materials



--- Page 243 ---

experimental ﬁndings only up to 1013 s1. In contrast to this, the Drude
theory correctly reproduces the spectral dependence of R even in the visible
spectrum. Proceeding to yet higher frequencies, however, the experimen-
tally found reﬂectivity eventually rises and then decreases again. Such
an absorption band cannot be explained by the Drude theory. For its
interpretation, a new concept needs to be applied.
Lorentz postulated that the electrons should be considered to be bound to
their nuclei and that an external electric ﬁeld displaces the positive charge of
an atomic nucleus against the negative charge of its electron cloud. In other
words, he represented each atom as an electric dipole. Retracting forces were
thought to occur which try to eliminate the displacement of charges. Lorentz
postulated further that the centers of gravity of the electric charges are
identical if no external forces are present. However, if one shines light onto
a solid, i.e., if one applies an alternating electric ﬁeld to the atoms, then the
dipoles are thought to perform forced vibrations. Thus, a dipole is considered
to behave similarly as a mass which is suspended on a spring, i.e., the
equations for a harmonic oscillator may be applied. An oscillator is known
to absorb a maximal amount of energy when excited near its resonance
frequency (Fig. 11.2). The absorbed energy is thought to be dissipated mainly
by diffuse radiation. Figure 11.2 resembles an absorption band as shown in
Fig. 11.1.
Forty or ﬁfty years ago, many scientists considered the electrons in
metals to behave at low frequencies as if they were free and at higher
frequencies as if they were bound. In other words, electrons in a metal
under the inﬂuence of light were described to behave as a series of classical
free electrons and a series of classical harmonic oscillators. Insulators and
semiconductors, on the other hand, were described by harmonic oscillators
only, see Fig. 11.1(b).
We shall now treat the optical constants of materials by applying the
above-mentioned theories.
Figure 11.2. Frequency dependence of the amplitude of a harmonic oscillator that is excited
to perform forced vibrations, assuming weak damping. n0 is the resonance frequency.
11. Atomistic Theory of the Optical Properties
229



--- Page 244 ---

11.2. Free Electrons Without Damping
We consider the simplest case at ﬁrst and assume that the free electrons are
excited to perform forced but undamped vibrations under the inﬂuence of an
external alternating ﬁeld, i.e., under the inﬂuence of light. As explained
in Section 11.1, the damping of the electrons is thought to be caused
by collisions between electrons and atoms of a nonideal lattice. Thus, we
neglect in this section the inﬂuence of lattice defects. For simplicity, we treat
the one-dimensional case because the result obtained this way does not
differ from the general case. Thus, we consider the interaction of plane-
polarized light with the electrons. The momentary value of the ﬁeld strength
of a plane-polarized light wave is given by
E ¼ E 0 exp iot
ð
Þ;
(11.1)
where o ¼ 2pn is the angular frequency, t is the time, and E 0 is the maximal
value of the ﬁeld strength. The equation describing the motion of an electron
that is excited to perform forced, harmonic vibrations under the inﬂuence of
light is (see Appendix 1 and (7.6))
m d2x
dt2 ¼ eE ¼ eE 0 exp iot
ð
Þ;
(11.2)
where e is the electron charge, m is the electron mass, and e · E is the
modulus of the excitation force. The stationary solution of this vibrational
equation is obtained by forming the second derivative of the trial solution
x ¼ x0 exp(iot) and inserting it into (11.2). This yields
x ¼ 
eE
m4p2n2 :
(11.3)
The vibrating electrons carry an electric dipole moment, which is the
product of the electron charge, e, and displacement, x, see (9.12). The
polarization, P, is deﬁned to be the sum of the dipole moments of all Nf
free electrons per cubic centimeter:
P ¼ exNf:
(11.4)
The dielectric constant can be calculated from polarization and electric ﬁeld
strength by combining (9.14) and (9.15):
e ¼ 1 þ P
e0E :
(11.5)
Inserting (11.3) and (11.4) into (11.5) yields
^e ¼ 1 
e2Nf
4p2e0mn2 :
(11.6)
230
III. Optical Properties of Materials



--- Page 245 ---

(It is appropriate to use in the present case the complex dielectric constant,
see below.) The dielectric constant equals the square of the index of
refraction, n, (see (10.12)). Equation (11.6) thus becomes
^n2 ¼ 1 
e2Nf
4p2e0mn2 :
(11.7)
We consider two special cases:
(a) For small frequencies, the term e2Nf/4p2e0mn2 is larger than one. Then
^n2 is negative and ^n imaginary. An imaginary ^n means that the real part
of ^n disappears. Equation (10.25) becomes, for n ¼ 0,
R ¼ n  1
ð
Þ2 þ k2
n þ 1
ð
Þ2 þ k2 ¼ 1 þ k2
1 þ k2 ¼ 1;
i.e., the reﬂectivity is 100% (see Fig. 11.3).
(b) For large frequencies (UV light), the term e2Nf/4p2e0mn2 becomes
smaller than one. Thus, ^n2 is positive and ^n  n real (but smaller than
one). The reﬂectivity for real values of ^n, i.e., for k ¼ 0, becomes
R ¼ n  1
ð
Þ2
n þ 1
ð
Þ2 ;
i.e., the material is essentially transparent for these wavelengths (and
perpendicular incidence) and therefore behaves optically like an insula-
tor, see Fig. 11.3.
We deﬁne a characteristic frequency, n1, often called the plasma fre-
quency, which separates the reﬂective region from the transparent region
(Fig. 11.3). The plasma frequency can also be deduced from (11.6) or (11.7).
We observe in these equations that e2Nf/4p2e0m must have the unit of the
square of a frequency, which we deﬁne to be n1. This yields
n2
1 ¼
e2Nf
4p2e0m :
(11.8)
Figure 11.3. Schematic frequency dependence of an alkali metal according to the free
electron theory without damping. n1 is the plasma frequency.
11. Atomistic Theory of the Optical Properties
231



--- Page 246 ---

Because of (11.8) we conclude from (11.6) that the dielectric constant
becomes zero at the plasma frequency. ^e ¼ 0 is the condition for a plasma
oscillation, i.e., a ﬂuid-like oscillation of the entire electron gas. We will
discuss this phenomenon in detail in Section 13.2.2.
The alkali metals behave essentially as shown in Fig. 11.3. They are
transparent in the near UV and reﬂect the light in the visible region. This
result indicates that the s-electrons5 of the outer shell of the alkali metals can
be considered to be free.
Table 11.1 contains some measured, as well as some calculated, plasma
frequencies. For the calculations, applying (11.8), one free electron per atom
was assumed. This means that Nf was set equal to the number of atoms per
volume, Na. (The latter quantity is obtained by using
Na ¼ N0  d
M
;
(11.9)
where N0 is the Avogadro constant, d ¼ density, and M ¼ atomic mass.)
We note in Table 11.1 that the calculated and the observed values for n1
are only identical for sodium. This may be interpreted to mean that only in
sodium does exactly one free electron per atom contribute to the electron
gas. For other metals an “effective number of free electrons” is commonly
introduced, which is deﬁned to be the ratio between the observed and
calculated n2
1 values:
n2
1 observed
ð
Þ
n2
1 calculated
ð
Þ ¼ Neff:
(11.10)
The effective number of free electrons is a parameter of great interest,
because it is contained in a number of nonoptical equations (such as the Hall
constant, electromigration, superconductivity, etc.). Since for most metals
the plasma frequency, n1, cannot be measured as readily as for the alkalis,
another avenue for determining Neff has to be found. For reasons which will
become clear later, Neff can be obtained by measuring n and k in the red or
Table 11.1. Plasma Frequencies and Effective Numbers of Free Electrons for
Some Alkali Metals.
Metal
Li
Na
K
Rb
Cs
n1 (1014 s1), observed
14.6
14.3
9.52
8.33
6.81
n1 (1014 s1), calculated
19.4
14.3
10.34
9.37
8.33
l1 nm (¼ c/n1), observed
150
210
290
320
360
Neff [free electrons/atom]
0.57
1.0
0.8
0.79
0.67
5See Appendix 3.
232
III. Optical Properties of Materials



--- Page 247 ---

IR spectrum (i.e., in a frequency range without absorption bands, Fig. 11.1)
and by applying
Neff ¼ 1  n2 þ k2
ð
Þ n24p2e0m
e2
:
(11.10a)
Equation (11.10a) follows by combining (11.6) with (10.10) and replacing
Nf by Neff.
11.3. Free Electrons With Damping (Classical Free
Electron Theory of Metals)
The simple reﬂectivity spectrum as depicted in Fig. 11.3 is seldom found
for metals. We need to reﬁne our model. We postulate that the motion of
electrons in metals is damped. More speciﬁcally, we postulate that the
velocity is reduced by collisions of the electrons with atoms of a nonideal
lattice. Lattice defects may be introduced into a solid by interstitial atoms,
vacancies, impurity atoms, dislocations, grain boundaries, or thermal
motion of the atoms.
To take account of the damping, we add to the vibration equation (11.2) a
damping term, g(dx/dt), which is proportional to the velocity (See Appendix 1
and (7.7)):
m d2x
dt2 þ g dx
dt ¼ eE ¼ eE 0 exp iot
ð
Þ:
(11.11)
We determine ﬁrst the damping factor, g. For this we write a particular
solution of (11.11) which is obtained by assuming that the electrons
drift under the inﬂuence of a steady or slowly varying electric ﬁeld (see
Section 7.3) with a velocity v0 ¼ const. through the crystal. (The drift
velocity of the electrons, which is caused by an external ﬁeld, is super-
imposed on the random motion of the electrons.) The damping is depicted to
be a friction force which counteracts the electron motion. v0 ¼ const. yields
d2x
dt2 ¼ 0:
(11.12)
By using (11.12), Equation (11.11) becomes
eE
g ¼ dx
dt ¼ v0:
(11.13)
The drift velocity is
v0 ¼
j
eNf
(11.14)
11. Atomistic Theory of the Optical Properties
233



--- Page 248 ---

(see (7.4)), where j is the current density (i.e., that current which passes
through an area of one square centimeter). Nf is the number of free electrons
per cubic centimeter. The current density is connected with the d.c. conduc-
tivity, s0, and the ﬁeld strength, E , by Ohm’s law (7.2),
j ¼ s0E :
(11.15)
Inserting (11.14) and (11.15) into (11.13) yields
g ¼ Nfe2
s0
:
(11.16)
Thus, (11.11) becomes
m d2x
dt2 þ Nfe2
s0
dx
dt ¼ eE ¼ eE 0 exp iot
ð
Þ:
(11.17)
We note that the damping term in (11.17) is inversely proportional to the
conductivity, i.e., proportional to the resistivity. This result makes sense.
The stationary solution of (11.17) is obtained, similarly as in Section 11.2,
by differentiating the trial solution x ¼ x0 exp (iot) by the time, and
inserting ﬁrst and second derivatives into (11.17), which yields
mo2x þ Nfe2
s0
xoi ¼ E e:
(11.18)
Rearranging (11.18) provides
x ¼
E
Nfeo
s0
i  mo2
e
:
(11.19)
Inserting (11.19) into (11.4) yields the polarization,
P ¼
eNfE
Nfeo
s0
i  mo2
e
:
(11.20)
With (11.20) and (11.5) the complex dielectric constant becomes
^e ¼ 1 þ P
e0E ¼ 1 þ
1
2pe0n
s0
i  m4p2e0
Nfe2 n2
:
(11.21)
The term Nf e2/m4p2e0 is set, as in (11.8), equal to n2
1, which reduces (11.21) to
^e ¼ 1 þ
1
2pe0n
s0
i  n2
n2
1
¼ 1 þ
n2
1
in 2pe0n2
1
s0
 n2
:
(11.22)
234
III. Optical Properties of Materials



--- Page 249 ---

The term 2pe0n2
1=s0 in (11.22) has the unit of a frequency. Thus, for
abbreviation, we deﬁne a damping frequency
n2 ¼ 2pe0n2
1
s0
¼ 2pe0n2
1r0:
(11.23)
(Table 11.2 lists values for n2 which were calculated using experimental
r0 and n1 values.) Now (11.22) becomes
^e ¼ 1 þ
n2
1
inn2  n2 ;
(11.24)
where ^e is, as usual, identical to ^n2,
^n
ð Þ2 ¼ n2  2nki  k2 ¼ 1 
n2
1
n2  nn2i :
(11.25)
Multiplying the numerator and denominator of the fraction in (11.25) by the
complex conjugate of the denominator (n2 þ nn2i) allows us to equate
individually real and imaginary parts. This provides the Drude equations
for the optical constants,
n2  k2 ¼ e1 ¼ 1 
n2
1
n2 þ n2
2
(11.26)
and
2nk ¼ e2 ¼ n2
n
n2
1
n2 þ n2
2
;
(11.27)
with the characteristic frequencies
n1 ¼
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
e2Nf
4p2e0m
s
(11.8)
and
n2 ¼ 2pe0n2
1
s0
:
(11.23)
Table 11.2. Resistivities and Damping Frequencies for Some Metals.
Metal
Li
Na
K
Rb
Cs
Cu
Ag
Au
r0 (mO cm)a
8.55
4.2
6.15
12.5
20
1.67
1.59
2.35
n2 (1012 s1)
10.1
4.8
3.1
4.82
5.15
4.7
4.35
5.9
a Handbook of Chemistry and Physics, 1977; room-temperature values.
11. Atomistic Theory of the Optical Properties
235



--- Page 250 ---

The functions e2 (absorption) and e1 (which is proportional to the dielectric
polarization, see Fig. 9.19), are plotted in Figs. 11.4 and 11.5 as a function of
frequency, making use of (11.27) and (11.26).
11.4. Special Cases
For the UV, visible, and near IR regions, the frequency varies between 1014
and 1015 s1. The average damping frequency, n2, is 5  1012 s1
(Table 11.2). Thus, n2  n2
2. Equation (11.27) then reduces to
e2 ¼ n2
n
n2
1
n2 :
(11.28)
With n  n1 (Table 11.1) we obtain
e2  n2
n :
(11.29)
Figure 11.5. The dielectric polarization, e1 ¼ n2  k2, as a function of frequency according
to the Drude theory for metals (schematic).
Figure 11.4. The absorption, e2 ¼ 2nk, versus frequency, n, according to the free electron
theory (schematic).
236
III. Optical Properties of Materials



--- Page 251 ---

Equation (11.29) conﬁrms that e2 plotted versus the frequency yields a
hyperbola with n2 as parameter (Fig. 11.4).
For very small frequencies n2  n2
2


, we may neglect n2 in the denomi-
nator of (11.27). This yields, with (11.23),
nkn ¼
s
4pe0
¼ 1
2
n2
1
n2
¼ s0
4pe0
:
(11.30)
Thus, in the far IR the a.c. conductivity, s, and the d.c. conductivity, s0, may
be considered to be identical. We have already made use of this condition in
Section 10.6. In general, however, s is not identical to the d.c. conductivity,
s0. (The same is true for the dielectric constant, e.)
11.5. Reﬂectivity
The reﬂectivity of metals is calculated using (10.29) in conjunction with
(11.26) and (11.27), see Fig. 11.6. We notice that the experimental behavior
for not-too-high frequencies (Fig. 11.1) is essentially reproduced. See also
in this context the experimentally obtained reﬂectivities in Figs. 13.7,
13.10, and 13.12. For higher frequencies, however, we need to resort to
a model different from the one discussed so far. This will be done in the
next chapter.
Figure 11.6. Calculated spectral reﬂectivity for a metal using the exact Drude equation
(solid line), and the Hagen–Rubens equation (10.34) using n1 ¼ 2  1015 s1 and n2 ¼
3.5  1012 s1.
11. Atomistic Theory of the Optical Properties
237



--- Page 252 ---

11.6. Bound Electrons (Classical Electron Theory
of Dielectric Materials)
The preceding sections have shown that the optical properties of metals
can be described and calculated quite well in the low-frequency range by
applying the free electron theory. We mentioned already that this theory
has its limits at higher frequencies, at which we observe that light is
absorbed and reﬂected by metals as well as by nonmetals in a narrow
frequency band. To interpret these absorption bands, Lorentz postulated
that the electrons are bound to their respective nuclei. He assumed that
under the inﬂuence of an external electric ﬁeld, the positively charged
nucleus and the negatively charged electron cloud are displaced with
respect to each other (Fig. 11.7). An electrostatic force tries to counteract
this displacement. For simplicity, we describe the negative charge of the
electrons to be united in one point. Thus, we describe the atom in an
electric ﬁeld as consisting of a positively charged core which is bound
quasielastically to one electron (electric dipole, Fig. 11.8). A bound
electron, thus, may be compared to a mass which is suspended from a
Figure 11.7. An atom is represented as a positively charged core and a surrounding,
negatively charged electron cloud (a) in equilibrium and (b) in an external electric ﬁeld.
Figure 11.8. Quasi-elastic bound electron in an external electric ﬁeld (harmonic oscillator).
238
III. Optical Properties of Materials



--- Page 253 ---

spring. Under the inﬂuence of an alternating electric ﬁeld (i.e., by light),
the electron is thought to perform forced vibrations. For the description of
these vibrations, the well-known equations of mechanics dealing with a
harmonic oscillator may be applied. This will be done now.
We ﬁrst consider an isolated atom, i.e., we neglect the inﬂuence of the
surrounding atoms upon the electron. An external electric ﬁeld with force
eE ¼ eE 0 exp iot
ð
Þ
(11.31)
periodically displaces an electron from its rest position by a distance x. This
displacement is counteracted by a restoring force, k  x, which is propor-
tional to the displacement, x. Then, the vibration equation becomes (see
Appendix 1)
m d2x
dt2 þ g0 dx
dt þ kx ¼ eE 0 exp iot
ð
Þ:
(11.32)
The factor k is the spring constant, which determines the binding strength
between the atom and electron. Each vibrating dipole (e.g., an antenna)
loses energy by radiation. Thus, g0(dx/dt) represents the damping of the
oscillator by radiation (g0 ¼ damping parameter). The stationary solution of
(11.32) for weak damping is (see Appendix 1)
x ¼
eE 0
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
exp i ot  f
ð
Þ
½
	;
(11.33)
where
o0 ¼ 2pn0 ¼
ﬃﬃﬃk
m
r
(11.34)
is called the resonance frequency of the oscillator, i.e., that frequency at
which the electron vibrates freely without an external force. f is the phase
difference between forced vibration and the excitation force of the light
wave. It is deﬁned to be (see Appendix 1)
tan f ¼
g0o
m o2
0  o2

 ¼
g0n
2pm n2
0  n2

 :
(11.35)
As in the previous sections, we calculate the optical constants starting with
the polarization, P, which is the product of the dipole moment, e  x, of one
dipole times the number of all dipoles (oscillators), Na. As before, we
assumed one oscillator per atom. Thus, Na is identical to the number of
atoms per unit volume. We obtain
P ¼ exNa:
(11.36)
11. Atomistic Theory of the Optical Properties
239



--- Page 254 ---

Inserting (11.33) yields
P ¼
e2NaE 0 exp i ot  f
ð
Þ
½
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
:
(11.37)
With
exp i ot  f
ð
Þ
½
	 ¼ exp iot
ð
Þ  exp if
ð
Þ
(11.38)
we obtain
P ¼
e2NaE
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
exp if
ð
Þ;
(11.39)
which yields with (11.5) and (10.12)
^e ¼ n2  k2  2nki ¼ 1 þ
e2Na
e0
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
exp if
ð
Þ: (11.40)
Equation (11.40) becomes with6
exp if
ð
Þ ¼ cos f  i sin f;
(11.41)
n2  k2  2nki ¼ 1 þ
e2Na
e0
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
cos f
 i
e2Na
e0
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
sin f:
(11.42)
The trigonometric terms in (11.42) are replaced, using (11.35), as follows:
cos f ¼
1
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
1 þ tan2f
p
¼
m o2
0  o2


ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
;
(11.43)
sin f ¼
tan f
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
1 þ tan2f
p
¼
g0o
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
m2 o2
0  o2

2 þ g02o2
q
:
(11.44)
6See Appendix 2.
240
III. Optical Properties of Materials



--- Page 255 ---

Separating the real and imaginary parts in (11.42) ﬁnally provides the
optical constants
e1 ¼ n2  k2 ¼ 1 þ
e2mNa o2
0  o2


e0 m2 o2
0  o2

2 þ g02o2
h
i ;
that is,
e1 ¼ 1 þ
e2mNa n2
0  n2


e0 4p2m2 n2
0  n2

2 þ g02n2
h
i ;
(11.45)
and
e2 ¼ 2nk ¼
e2Nag0o
e0 m2 o2
0  o2

2 þ g02o2
h
i ;
or
e2 ¼
e2Nag0n
2pe0 4p2m2 n2
0  n2

2 þ g02n2
h
i :
(11.46)
The frequency dependencies of e1 and e2 are plotted in Figs. 11.9 and 11.10.
Figure 11.9 resembles the dispersion curve for the index of refraction as it is
experimentally obtained for dielectrics. Figure 11.10 depicts the absorption
product, e2, in the vicinity of the resonance frequency, n0, (absorption band)
as experimentally observed for dielectrics. Equations (11.45) and (11.46)
reduce to the Drude equations for n0 ! 0 (no oscillators).
Figures 11.9 and 11.10. Frequency dependence of the dielectric polarization, e1 ¼ n2  k2,
and absorption, e2 ¼ 2nk, as calculated with (11.45) and (11.46), respectively, using charac-
teristic values for Na and g0.
11. Atomistic Theory of the Optical Properties
241



--- Page 256 ---

*11.7. Discussion of the Lorentz Equations
for Special Cases
11.7.1. High Frequencies
We observe in Fig. 11.10 that e2 approaches zero at high frequencies and
far away from any resonances (absorption bands). In the same frequency
region, e1 ¼ n2  k2 and, thus, essentially n, assumes the constant value 1
(Fig. 11.9). This is consistent with experimental observations that X-rays are
not refracted and are not absorbed by many materials. (Note, however, that
highly energetic X-rays interact with the inner electrons, i.e., they may be
absorbed by the K, L, . . ., etc. electrons. Metals are, therefore, opaque for
high-energetic X-rays).
11.7.2. Small Damping
We consider the case for which the radiation-induced energy loss of the
oscillator is very small. Then, g0 is small. With g0n2  4p2m2 n2
0  n2

2
(which is only valid for n 6¼ n0), equation (11.45) reduces to
e1 ¼ n2  k2 ¼ 1 þ
e2Na
4p2e0m n2
0  n2

 :
(11.47)
Figure 11.11 depicts a sketch of (11.47). We observe that for small damping,
e1 (and thus essentially n2) approaches inﬁnity near the resonance frequency.
A dispersion curve such as Fig. 11.11 is indeed observed for many dielectrics
(glass, etc.).
Figures 11.11 and 11.12. The functions e1 (n2) and e2, respectively, versus frequency
according to the bound electron theory for the special case of small damping.
242
III. Optical Properties of Materials



--- Page 257 ---

11.7.3. Absorption Near n0
Electrons absorb most energy from light at the resonance frequency, i.e.,
e2 has a maximum near n0. For small damping, the absorption band becomes
an absorption line (see Fig. 11.12). Inserting n ¼ n0 into (11.46) yields
e2 ¼
e2Na
2pe0g0n0
;
(11.48)
which shows that the absorption becomes large for small damping (g0).
11.7.4. More Than One Oscillator
At the beginning of Section 11.6 we assumed that one electron is quasie-
lastically bound to a given nucleus; in other words, we assumed one
oscillator per atom. This assumption is certainly a gross simpliﬁcation, as
one can deduce from the occurrence of multiple absorption bands in experi-
mental optical spectra. Thus, each atom has to be associated with a number
of i oscillators, each having an oscillator strength, fi. The ith oscillator
vibrates with its resonance frequency, n0i. The related damping constant is
gi0. (This description has its equivalent in the mechanics of a system of mass
points having one basic frequency and higher harmonics.) If all oscillators
are taken into account, (11.45) and (11.46) become
e1 ¼ n2  k2 ¼ 1 þ e2mNa
e0
X
i
fi n2
0i  n2


4p2m2 n2
0i  n2

2 þ g0
i2n2 ;
e2 ¼ 2nk ¼ e2Na
2pe0
X
i
fing0
i
4p2m2 n2
0i  n2

2 þ g0
i
2n2 :
(11.49)
(11.50)
Equations (11.49) and (11.50) reduce for weak damping (see above) to
e1 ¼ n2  k2  n2 ¼ 1 þ e2Na
4p2e0m
X
i
fi
n2
0i  n2 ;
(11.51)
e2 ¼ 2nk ¼
e2Na
8p3e0m2
X
i
fing 0
i
n2
0i  n2

2 :
(11.52)
11. Atomistic Theory of the Optical Properties
243



--- Page 258 ---

11.8. Contributions of Free Electrons and Harmonic
Oscillators to the Optical Constants
In the previous section, we ascribed two different properties to the electrons
of a solid. In Section 11.4 we postulated that Nf electrons move freely in
metals under the inﬂuence of an electric ﬁeld and that this motion is damped
by collisions of the electrons with vibrating lattice atoms and lattice defects.
In Section 11.6 we postulated that a certain number of electrons are quasie-
lastically bound to Na atoms which are excited by light to perform forced
vibrations. The energy loss was thought to be by radiation.
The optical properties of metals may be described by postulating a certain
number of free electrons and a certain number of harmonic oscillators. Both
the free electrons and the oscillators contribute to the polarization. Thus, the
equations for the optical constants may be rewritten, by combining (11.26),
(11.27), (11.49), and (11.50),
e1 ¼ 1 
n2
1
n2 þ n2
2
þ e2mNa
e0
X
i
fi n2
0i  n2


4p2m2 n2
0i  n2

2 þ g02
i n2 ;
(11.53)
e2 ¼ 2nk ¼ n2
n
n2
1
n2 þ n2
2
þ e2Na
2pe0
X
i
fing0
i
4p2m2 n2
0i  n2

2 þ g02
i n2 :
(11.54)
Figures 11.13 and 11.14 depict schematically the frequency dependence
of e1 and e2 as obtained by using (11.53) and (11.54). These ﬁgures also
Figures 11.13 and 11.14. Frequency dependence of e1 and e2 according to (11.53) and
(11.54). (i ¼ 1). f ¼ free electron theory; b ¼ bound electron theory; S ¼ summary curve
(schematic).
244
III. Optical Properties of Materials



--- Page 259 ---

show the contributions of free and bound electrons on the optical constants.
The experimentally found frequency dependence of e1 and e2 resembles
these calculated spectra quite well. We will elaborate on this in Chapter 13,
in which experimental results are presented.
Problems
1. Calculate the reﬂectivity of sodium in the frequency ranges n > n1 and n < n1 using the
theory for free electrons without damping. Sketch R versus frequency.
2. The plasma frequency, n1, can be calculated for the alkali metals by assuming one free
electron per atom, i.e., by substituting for Nf the number of atoms per unit volume
(atomic density, Na). Calculate n1 for potassium and lithium.
3. Calculate Neff for sodium and potassium. For which of these two metals is the assump-
tion of one free electron per atom justiﬁed?
4. What is the meaning of the frequencies n1 and n2? In which frequency ranges are they
situated compared to visible light?
5. Calculate the reﬂectivity of gold at n ¼ 9  1012 s1 from its conductivity. Is the
reﬂectivity increasing or decreasing at this frequency when the temperature is increased?
Explain.
6. Calculate n1 and n2 for silver (0.5  1023 free electrons per cubic centimeter).
7. The experimentally found dispersion of NaCl is as follows:
l [mm]
0.3
0.4
0.5
0.7
1
2
5
N
1.607
1.568
1.552
1.539
1.532
1.527
1.519
Plot these results along with calculated values obtained by using the equations of the
“bound electron theory” assuming small damping. Let
e2Na
4p2e0m ¼ 1:81  1030 s2
and
n0 ¼ 1:47  1015s1:
8. The optical properties of an absorbing medium can be characterized by various sets of
parameters. One such set is the index of refraction and the damping constant. Explain
the physical signiﬁcance of those parameters, and indicate how they are related to the
complex dielectric constant of the medium. What other sets of parameters are commonly
used to characterize the optical properties? Why are there always “sets” of parameters?
9. Describe the damping mechanisms for free electrons and bound electrons.
10. Why does it make sense that we assume one free electron per atom for the alkali metals?
11. Derive the Drude equations from (11.45) and (11.46) by setting n0 ! 0.
12. Calculate the effective number of free electrons per cubic centimeter and per atom for
silver from its optical constants (n ¼ 0.05 and k ¼ 4.09 at 600 nm). (Hint: Use the free
11. Atomistic Theory of the Optical Properties
245



--- Page 260 ---

electron mass.) How many free electrons per atom would you expect? Does the result
make sense? Why may we use the free electron theory for this wavelength?
13. Computer problem. Plot (11.26), (11.27), and (10.29) for various values of n1 and n2.
Start with n1 ¼ 2  1015 s1 and n2 ¼ 3.5  1012 s1.
14. Computer problem. Plot (11.45), (11.46), and (10.29) for various values of Na, g0, and
n0. Start with n0 ¼ 1.5  1015 s1 and Na ¼ 2.2  1022 cm3 and vary g0 between 100
and 0.1.
15. Computer problem. Plot (11.51), (11.52), and (10.29) by varying the parameters as in the
previous problems. Use one, two or three oscillators. Try to “ﬁt” an experimental curve
such as the ones in Figs. 13.10 or 13.11.
246
III. Optical Properties of Materials



--- Page 261 ---

CHAPTER 12
Quantum Mechanical Treatment
of the Optical Properties
12.1. Introduction
We assumed in the preceding chapter that the electrons behave like parti-
cles. This working hypothesis provided us (at least for small frequencies)
with equations which reproduce the optical spectra of solids reasonably
well. Unfortunately, the treatment had one ﬂaw: For calculation and inter-
pretation of the infrared (IR) absorption we used the concept that electrons
in metals are free; whereas the absorption bands in the visible and ultraviolet
(UV) spectrum could only be explained by postulating harmonic oscillators.
From the classical point of view, however, it is not immediately evident why
the electrons should behave freely at low frequencies and respond as if they
would be bound at higher frequencies. An unconstrained interpretation for
this is only possible by applying wave mechanics. This will be done in the
present chapter. We make use of the material presented in Chapters 5 and 6.
12.2. Absorption of Light by Interband and Intraband
Transitions
When light (photons) having sufﬁciently large energy impinges on a solid,
the electrons in this crystal are thought to be excited into a higher energy
level, provided that unoccupied higher energy levels are available. For these
transitions the total momentum of electrons and photons must remain
constant (conservation of momentum). For optical frequencies, the momen-
tum of a photon, and thus its wave vector kphot ¼ p/h (see (4.7)), is much
smaller than that of an electron. Thus, kphot is much smaller than the
R.E. Hummel, Electronic Properties of Materials 4th edition,
DOI 10.1007/978-1-4419-8164-6_12, # Springer ScienceþBusiness Media, LLC 2011
247



--- Page 262 ---

diameter of the Brillouin zone (Fig. 12.1). Electron transitions at which
k remains constant (vertical transitions) are called “direct interband
transitions”. Optical spectra for metals are dominated by direct interband
transitions.
Another type of interband transition is possible however. It involves the
absorption of a light quantum under participation of a phonon (lattice
vibration quantum, see Chapter 20). To better understand these “indirect
interband transitions” (Fig. 12.2) we have to know that a phonon can only
absorb very small energies, but is able to absorb a large momentum compa-
rable to that of an electron. During an indirect interband transition, the
excess momentum (i.e., the wave number vector) is transferred to the lattice
(or is absorbed from the lattice). In other words, a phonon is exchanged with
Figure 12.1. Electron bands and direct interband transitions in a reduced zone. (Compare
with Fig. 5.4).
Figure 12.2. Indirect interband transition. (The properties of phonons are explained in
Chapter 20).
248
III. Optical Properties of Materials



--- Page 263 ---

the solid. Indirect interband transitions may be disregarded for the interpre-
tation of metal spectra, because they are generally weaker than direct
transitions by two or three orders of magnitude. They are only observed in
the absence of direct transitions. In the case of semiconductors, however,
and for the interpretation of photoemission, indirect interband transitions
play an important role.
We now make use of the simpliﬁed model depicted in Fig. 12.1 and
consider direct interband transitions from the n to the m band. The smallest
photon energy in this model is absorbed by those electrons whose energy
equals the Fermi energy, EF, i.e., by electrons which already possess the
highest possible energy at T ¼ 0 K. This energy is marked in Fig. 12.1 by
hna. Similarly, hnb is the largest energy, which leads to an interband transition
from the n to the m band. In the present case, a variety of interband transitions
may take place between the energy interval hna and hnb.
Interband transitions are also possible by skipping one or more bands,
which occur by involving photons with even larger energies. Thus, a
multitude of absorption bands are possible. These bands may partially
overlap.
As an example for interband transitions in an actual case, we consider the
band diagram for copper. In Fig. 12.3, a portion of Fig. 5.22 is shown, i.e.,
the pertinent bands around the L-symmetry point are depicted. The inter-
band transition having the smallest possible energy difference is shown to
occur between the upper d-band and the Fermi energy. This smallest energy
is called the “threshold energy for interband transitions” (or the “funda-
mental edge”) and is marked in Fig. 12.3 by a solid arrow. We mention in
passing that this transition, which can be stimulated by a photon energy of
Figure 12.3. Section of the band diagram for copper (schematic). Two pertinent interband
transitions are shown with arrows. The smallest possible interband transition occurs from a
ﬁlled d-state to an unﬁlled state just above the Fermi energy.
12. Quantum Mechanical Treatment of the Optical Properties
249



--- Page 264 ---

2.2 eV, is responsible for the red color of copper. At slightly higher photon
energies, a second transition takes place, which originates from the Fermi
energy. It is marked in Fig. 12.3 by a dashed arrow. Needless to say, many
more transitions are possible. They can take place over a wide range in the
Brillouin zone. This will become clearer in Chapter 13 when we return to the
optical spectra of materials and their interpretation.
We now turn to another photon-induced absorption mechanism. Under
certain conditions photons may excite electrons into a higher energy level
within the same band. This occurs with participation of a phonon, i.e., a
lattice vibration quantum. We call such a transition, appropriately, an intra-
band transition (Fig. 12.4). It should be kept in mind, however, that
because of the Pauli principle, electrons can only be excited into empty
states. Thus, intraband transitions are mainly observed in metals because
metals have unﬁlled electron bands. We recognize, however, that semicon-
ductors with high doping levels or which are kept at high temperatures may
likewise have partially ﬁlled conduction bands.
Intraband transitions are equivalent to the behavior of free electrons in
classical physics, i.e., to the “classical infrared absorption.” Insulators and
semiconductors have no classical infrared absorption because their bands
are either completely ﬁlled or completely empty (except at high tempera-
tures and due to doping). This explains why some insulators (such as glass)
are transparent in the visible spectrum. The largest photon energy, Emax, that
can be absorbed by means of an intraband transition corresponds to an
excitation from the lower to the upper band edge, see Fig. 12.4. All energies
smaller than Emax are absorbed continuously.
Figure 12.4. Intraband transitions. The largest energy that can be absorbed by intraband
transitions is obtained by projecting the arrow marked “Emax” onto the energy axis.
250
III. Optical Properties of Materials



--- Page 265 ---

In summary, at low photon energies, intraband transitions (if possible)
are the prevailing absorption mechanism. Intraband transitions are not
quantized and occur essentially in metals only. Above a critical light energy
interband transitions set in. Only certain energies or energy intervals are
absorbed in this case. The onset of this absorption mechanism depends on
the energy difference between the bands in question. Interband transitions
occur in metals as well as in insulators or semiconductors. They are analo-
gous to optical excitations in solids with bound electrons. In an intermediate
frequency range, interband as well as intraband transitions may take place
(see Fig. 11.1).
12.3. Optical Spectra of Materials
Optical spectra are the principal means to obtain experimentally the band
gaps and energies for interband transitions. For isolated atoms and ions, the
absorption and emission spectra are known to be extremely sharp. Thus,
absorption and emission energies for atoms can be determined with great
accuracy. The same is basically true for molecular spectra. In contrast to
this, the optical spectra of solids are rather broad. This stems from the high
particle density in solids and from the interatomic interactions, which split
the atomic levels into quasi-continuous bands. The latter extend through the
three-dimensional momentum space of a Brillouin zone.
A further factor has to be considered, too. Plain reﬂection spectra of
solids are, in general, not too useful for the deduction of transition energies,
mainly because R is a rather involved function of e1 and e2 (see (10.29)).
Thus, e2 (i.e., absorption) spectra are often utilized instead. The charac-
teristic features in the e2-spectra of solids stem from discontinuities in the
energy proﬁle of the density of states. However, relatively sharp features
in e2-spectra are superimposed on noncharacteristic transitions from other
parts of the Brillouin zone. In other words, the e2-spectra derive their shape
from a summation over extended, rather than localized, regions in the
Brillouin zone. Modulated optical spectra (see Section 13.1.3) separate
the small contributions stemming from points of high symmetry (such as
the centers and edges of a Brillouin zone) from the general, much larger
background. This will become clearer in the next chapter.
12.4. Dispersion
To calculate the behavior of electrons in a periodic lattice we used, in
Section 4.4, the periodic potential shown in Fig. 4.9. We implied at that
time that the potential does not vary with time. This proposition needs to be
12. Quantum Mechanical Treatment of the Optical Properties
251



--- Page 266 ---

dropped when the interaction of light with a solid is considered. The alter-
nating electric ﬁeld of the light which impinges on the solid perturbs the
potential ﬁeld of the lattice periodically. Thus, we need to add to the potential
energy a correction term, the so-called perturbation potential, V0,
V ¼ V0 þ V0
(12.1)
(V0 ¼ unperturbed potential energy). It goes without saying that this pertur-
bational potential oscillates with the frequency, n, of the light.
We consider, as always, plane-polarized light. The momentary value of
the ﬁeld strength, E , is
E ¼ A cos ot;
(12.2)
where A is the maximal value of the ﬁeld strength. Then, the perturbation
potential (potential energy of the perturbation, or force times displacement
x) is
V0 ¼ eE x ¼ eA cos ot
ð
Þ  x:
(12.3)
Since the potential now varies with time, we need to make use of the time-
dependent Schr€odinger equation (3.8),
r2C  2m
\2 VC  2im
\
@C
@t ¼ 0;
(12.4)
which reads, with (12.1) and (12.3),
r2C  2m
\2 V0 þ eAx cos ot
ð
ÞC  2im
\
@C
@t ¼ 0:
(12.5)
Our goal is to calculate the optical constants from the polarization, in a
similar way as it was done in Sections 11.2, 11.3, and 11.6. We have to note,
however, the following: In wave mechanics, the electron is not considered
to be a point, but instead is thought to be “smeared” about the space dt.
The locus of the electron in classical mechanics is thus replaced by the
probability, CC, of ﬁnding an electron in space (see (2.12)). The classical
polarization
P ¼ Nex
(11.4) is replaced in wave mechanics by
P ¼ Ne
ð
xCCdt:
(12.6)
We seek to ﬁnd a solution C of the perturbed Schr€odinger equation (12.5)
and calculate from that the norm CC; then, by using (12.6) we can
calculate the polarization P. The equation for the optical constants thus
obtained is given in (12.31).
252
III. Optical Properties of Materials



--- Page 267 ---

The detailed calculation of this approach will be given below. The ﬁrst
step is to transform the space- and time-dependent Schr€odinger equation
into a Schr€odinger equation that is only space-dependent. The perturbed
Schr€odinger equation (12.5) is rewritten, using the Euler equation7
cos r ¼ 1
2 eir þ eir
ð
Þ, as
r2C  2m
\2 V0C  2im
\
@C
@t ¼ 2m
\2 eAx 1
2 eiot þ eiot


C:
(12.7)
Now, the left side of (12.7) has the form of the unperturbed Schr€odinger
equation (12.4). We assume that the perturbation is very small. Then, we
can insert in the perturbation term (right side of (12.7)) the expression (3.4),
and get
C0
i x; y; z; t
ð
Þ ¼ c0
i x; y; z
ð
Þeioit
(12.8)
for the unperturbed ith eigenfunction. This yields
r2C  2m
\2 V0C  2im
\
@C
@t ¼ m
\2 eAxc0
i ei oiþo
ð
Þt þ ei oio
ð
Þt
h
i
:
(12.9)
The right-hand side will be contracted to simplify the calculation:
r2C  2m
\2 V0C  2im
\
@C
@t ¼ m
\2 eAxc0
i ei oio
ð
Þt:
(12.10)
To solve (12.10), we seek a trial solution which consists of an unperturbed
solution and two terms with the angular frequencies (oi + o) and (oi  o):
C ¼ C0
i þ cþei oiþo
ð
Þt þ c ei oio
ð
Þt:
(12.11)
This trial solution is condensed as before
C ¼ C0
i þ cei oio
ð
Þt:
(12.12)
Equation (12.12) is differentiated twice with respect to space and once with
respect to time, and the results are inserted into (12.10). This yields
r2C0
i þ r2cei oio
ð
Þt 2m
\2 V0C0
i  2m
\ V0cei oio
ð
Þt
 2im
\
@C0
i
@t þ 2m
\
oi  o
ð
Þcei oio
ð
Þt ¼ m
\2 eAxc0
i ei oio
ð
Þt:
(12.13)
The underlined terms in (12.13) vanish according to (12.4) if C0
i is the
solution to the unperturbed Schr€odinger equation. In the remaining terms,
the exponential factors can be cancelled, which yields, with \o ¼ hn ¼ E,
7See Appendix 2.
12. Quantum Mechanical Treatment of the Optical Properties
253



--- Page 268 ---

r2c þ 2m
\2 c Ei  hn  V0
ð
Þ ¼ m
\2 eAxc0
i :
(12.14)
In writing (12.14) we have reached our ﬁrst goal, i.e., to obtain a time-
independent, perturbed Schr€odinger equation. We solve this equation with a
procedure that is common in perturbation theory. We develop the function
xc0
i (the right side of (12.14)) in a series of eigenfunctions
xc0
i ¼ a1ic0
1 þ a2ic0
2 þ    þ anic0
n þ    ¼
X
anic0
n:
(12.15)
multiply (12.15) by c0
n , and integrate over the entire space dt. Then, due to
Ð
cc dt ¼ 1 (3.15) and
Ð
cmcn
 dt ¼ 0 (for m 6¼ n), we obtain
ð
xc0
i c0
n dt ¼ a1i
ð
c0
1c0
n dt
|ﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄ}
0
þ    þ ani
0
l
ð
c0
nc0
n dt
|ﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄ}
1
þ    ¼ ani: (12.16)
Similarly, we develop the function c in a series of eigenfunctions
c ¼
X
bnc0
n:
(12.17)
Inserting (12.15) and (12.17) into (12.14) yields
X
bn r2c0
n þ 2m
\2 Eic0
n  2m
\2 hnc0
n  2m
\2 V0c0
n


¼ m
\2 eA
X
anic0
n:
(12.18)
Rewriting the unperturbed time-independent Schr€odinger equation (3.1)
yields
r2c0
n  2m
\2 V0c0
n ¼  2m
\2 Enc0
n:
(12.19)
Equation (12.19) shows that the underlined terms in (12.18) may be equated
to the right side of (12.19). Thus, (12.18) may be rewritten as
2m
\2
X
c0
nbn Ei  En  hn
ð
Þ ¼ 2m
\2
eA
2
X
c0
nani:
(12.20)
Comparing the coefﬁcients in (12.20) yields, with
Ei  En ¼ Eni ¼ hnni;
(12.21)
the following expression:
bn ¼
eAani
2 Ei  En  hn
ð
Þ ¼
eAani
2h nni  n
ð
Þ :
(12.22)
Now we are able to determine the functions c+ and c by using (12.22) and
(12.17). We insert these functions together with (3.4) into the trial solution
254
III. Optical Properties of Materials



--- Page 269 ---

(12.11) and obtain a solution for the time-dependent, perturbed Schr€odinger
equation (12.5)
C ¼ c0
i eioit þ 1
2h
X
eAanic0
n
ei oiþo
ð
Þt
nni þ n þ ei oio
ð
Þt
nni  n


;
(12.23)
and thus
C ¼ c0
i eioit þ 1
2h
X
eAa
nic0
n
ei oiþo
ð
Þt
nni þ n þ ei oio
ð
Þt
nni  n


:
(12.24)
In order to write the polarization (12.6) we have to form the product CC.
As can be seen from (12.23) and (12.24), this calculation yields time-
dependent as well as time-independent terms. The latter ones need not be
considered here, since they provided only an additive constant to the
polarization (light scattering). The time-dependent part of the norm CC is
CC ¼ eA
2h
X
a
nic0
n c0
i
eiot
nni þ n þ
eiot
nni  n
|ﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ}
Q
0
B
B
B
@
1
C
C
C
A
2
6664
þ
X
anic0
nc0
i
eiot
nni þ n þ eiot
nni  n
|ﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄﬄ}
R
0
B
B
@
1
C
C
A
3
775:
(12.25)
To simplify, we abbreviate the terms in parentheses by Q and R, respec-
tively. The polarization (12.6) is then
P ¼ Ne2A
2h
X
a
niQ
ð
xc0
n c0
i dt
|ﬄﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄﬄ}
ani
þ
X
aniR
ð
xc0
nc0
i dt
|ﬄﬄﬄﬄﬄﬄﬄ{zﬄﬄﬄﬄﬄﬄﬄ}
a
ni
2
6664
3
7775;
(12.26)
which reduces, with (12.16),
ð
xc0
i c0
n dt ¼ ani
and
ani  a
ni ¼ janij2  a2
ni
(12.27)
to
P ¼ Ne2A
2h
X
a2
ni Q þ R
ð
Þ :
(12.28)
12. Quantum Mechanical Treatment of the Optical Properties
255



--- Page 270 ---

A numerical calculation applying the above-quoted Euler equation yields
Q þ R ¼ 2nnieiot
n2
ni  n2 þ 2nnieiot
n2
ni  n2 ¼ 4nni cos ot
n2
ni  n2 ;
(12.29)
which gives, with (12.2),
P ¼ Ne2E
p\
X
a2
ni
nni
n2
ni  n2 :
(12.30)
Finally, we make use of (10.13) and (11.5) and obtain with, (12.30),
e1 ¼ n2  k2 ¼ 1 þ Ne2
e0p\
X
a2
ni
nni
n2
ni  n2 :
(12.31)
Equation (12.31) is the sought-after relation for the optical properties of
solids, obtained by wave mechanics. It is similar in form to the classical
dispersion equation (11.51). A comparison of classical and quantum
mechanical results might be helpful to better understand the meaning of
the empirically introduced oscillator strength, fi. We obtain
fi ¼ 4pm
\ a2
ninni:
(12.32)
We know that hnni is that energy which an electron absorbs when it is excited
from the n-band into the i-band (e.g., the m-band). Thus, the resonance
frequency, noi, of the ith oscillator introduced in Section 11.7.4 is replaced
in wave mechanics by a frequency, nni, that corresponds to an allowed
electron transition from the nth into the ith band. Furthermore, we see from
(12.16) that ani is proportional to the probability of an electron transition from
the nth into the ith band. The oscillator strength, fi, is, therefore, essentially the
probability for a certain interband transition.
Problems
1. What information can be gained from the quantum mechanical treatment of the optical
properties of metals which cannot be obtained by the classical treatment?
2. What can we conclude from the fact that the spectral reﬂectivity of a metal (e.g., copper)
has “structure”?
3. Below the reﬂection spectra for two materials A and B are given.
a. What type of material belongs to reﬂection spectrum A, what type to B? (Justify). Note
the scale difference! Some reﬂection takes place below 1.5 eV in material B!
b. For which colors are these (bulk) materials transparent?
c. What is the approximate threshold energy for interband transitions for these materials?
256
III. Optical Properties of Materials



--- Page 271 ---

d. For which of the materials would you expect intraband transitions in the infrared
region? (Justify.)
e. Why do these intraband transitions occur in this region?
4. What is the smallest possible energy for interband transitions for aluminum?
(Hint: Consult the band diagram in Fig. 5.21.)
5. Are intraband transitions possible in semiconductors at high temperatures?
12. Quantum Mechanical Treatment of the Optical Properties
257



--- Page 272 ---

CHAPTER 13
Applications
13.1. Measurement of the Optical Properties
The measurement of the optical properties of solids is simple in principle,
but can be involved in practice. This is so because many bulk solids (parti-
cularly metals) are opaque, so that the measurements have to be taken in
reﬂection. Light penetrates about 10 nm into a metal (see Table 10.1). As a
consequence, the optical properties are basically measured near the surface,
which is susceptible to oxidation, deformation (polishing), or contamination
by adsorbed layers. One tries to alleviate the associated problems by utiliz-
ing ultrahigh vacuum, vapor deposition, sputtering, etc. Needless to say, the
method by which a given sample was prepared may have an effect on the
numerical value of its optical properties.
Let us assume that the surface problems have been resolved. Then, still
another problem remains. The most relevant optical properties, namely, n, k,
e1, e2, and the energies for interband transitions cannot be easily deduced by
simply measuring the reﬂectivity, i.e., the ratio between reﬂected and incident
intensity. Thus, a wide range of techniques have been developed in the past
century to obtain the above-mentioned parameters. Only three methods will
be brieﬂy discussed here. It should be mentioned, however, that thirty or forty
other techniques could be easily presented. They all have certain advantages
for some speciﬁc applications and disadvantages for others. The reader who is
not interested in the measurement of optical properties may skip the next three
sections for the time being and return to them at a later time.
R.E. Hummel, Electronic Properties of Materials 4th edition,
DOI 10.1007/978-1-4419-8164-6_13, # Springer ScienceþBusiness Media, LLC 2011
259



--- Page 273 ---

*13.1.1. Kramers–Kronig Analysis (Dispersion Relations)
This method was very popular in the 1960s and involves the measurement of
the reﬂectivity over a wide spectral range. A relationship exists between real
and imaginary terms of any complex function, which enables one to calcu-
late one component of a complex quantity if the other one is known. In the
present case, one calculates the phase jump, d0, (between the reﬂected and
incident ray) from the reﬂectivity, R, which was measured at a given
frequency, n. This is accomplished by the Kramers–Kronig relation,
d0 nx
ð Þ ¼ 1
p
ð 1
0
d ln r
dn
ln n þ nx
n  nx

dn;
(13.1)
where
r ¼
ﬃﬃﬃ
R
p
¼
ﬃﬃﬃﬃ
IR
I0
r
(13.2)
is obtained from the reﬂected intensity, IR, and the incident intensity, I0, of
the light. The optical constants are calculated by applying
n ¼
1  r2
1 þ r2 þ 2r cos d0
(13.3)
and
k ¼
2r sin d0
1 þ r2 þ 2r cos d0 :
(13.4)
Equation (13.1) shows that the reﬂectivity should be known in the entire
frequency range (i.e., between n ¼ 0 and n ¼ 1). Since measured values can
hardly be obtained for such a large frequency range, one usually extrapolates
the reﬂectivity beyond the experimental region using theoretical or phenome-
nological considerations. Such an extrapolation would not cause a substantial
error if one could assume that no interband transitions exist beyond the
measured spectral range. This assumption is probably valid only on rare
occasions. (For details, see specialized books listed at the end of Part III.)
*13.1.2. Spectroscopic Ellipsometry
This technique was developed in its original form at the turn of the 20th
century. The underlying idea is as follows: If plane-polarized light impinges
under an angle a on a metal, the reﬂected light is generally elliptically
polarized. The analysis of this elliptically polarized light yields two para-
meters, the azimuth and the phase difference, from which the optical
properties are calculated.
260
III. Optical Properties of Materials



--- Page 274 ---

We consider plane-polarized light whose vibrational plane is inclined by
45 towards the plane of incidence (Fig. 13.1). This angle is called azimuth,
ce, in contrast to the azimuth of the reﬂected light, cr, which is deﬁned as
tan cr ¼ E Rp
E Rs
(13.5)
(see Fig. 13.1), where ERp and ERs are parallel and perpendicular compo-
nents of the reﬂected electric ﬁeld strength |E |, i.e., the amplitudes of the
reﬂected light wave.
In elliptically polarized light, the length and direction of the light vector
is altered periodically. The tip of the light vector moves along a continuous
screw, having the direction of propagation as an axis (Fig. 13.2(a)). The
projection of this screw onto the x  y plane is an ellipse (Fig. 13.1).
Elliptically polarized light can be thought of as composed of two mutually
perpendicular, plane-polarized waves, having a phase difference d between
them (expressed in fractions of 2p) (see Fig. 13.2(b)).
For the actual measurement of cr and d, one needs two polarizers (con-
sisting of a birefringent material, which allows only plane-polarized light to
pass), and a compensator (also consisting of birefringent material, which
allows one to measure the phase difference d; see Fig. 13.3). In Fig 13.4, the
light reﬂected from a metal is represented by two light vectors pointing in
the x- and y-directions, respectively. They have a phase difference d
between them. By varying the thickness of the birefringent materials in
the compensator, one eventually accomplishes that the light which leaves
the compensator is plane-polarized (i.e., d ¼ 0). The resultant vector, Rres,
is then tilted by an angle, cr, against the normal to the plane of incidence.
Figure 13.1. Reﬂection of plane-polarized light on a metal surface. (Note: In the ﬁgure
E Rp  Rp and E Rs  Rs).
13. Applications
261



--- Page 275 ---

One determines cr by turning the analyzer to a position at which its axis is
perpendicular to Rres. In short, d and cr are measured by simultaneously
altering the thickness of the compensator and turning the analyzer until no
light leaves the analyzer. It is evident that this method is cumbersome and
time-consuming, particularly in cases in which an entire spectrum needs to
be measured point by point. Thus, in recent years automated and computer-
ized ellipsometers have been developed.
The optical constants are calculated using
n2 ¼ 1
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
a2  b2 þ sin2a

2 þ 4a2b2
q
þ a2  b2 þ sin2a


;
(13.6)
Figure 13.2. (a) Elliptically polarized light and (b) decomposition of elliptically polarized
light into two mutually perpendicular plane-polarized waves with phase difference d.
Adapted from R.W. Pohl, Optik und Atomphysik. Springer-Verlag, Berlin (1958).
Figure 13.3. Schematic of an ellipsometer (polarizer and analyzer are identical devices).
262
III. Optical Properties of Materials



--- Page 276 ---

k2 ¼ 1
2
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ
a2  b2 þ sin2a

2 þ 4a2b2
q
 a2  b2 þ sin2a




;
(13.7)
with
a ¼ sin a tan a cos 2cr
1  cos d sin 2cr
(13.8)
and
b ¼ a sin d tan 2cr:
(13.9)
Alternatively, one obtains, for the polarization e1 and absorption e2,
e1 ¼ n2  k2 ¼ sin2a 1 þ tan2 a cos2 2cr  sin2 2cr sin2 d


1  sin 2cr cos d
ð
Þ2
"
#
;
(13.10)
e2 ¼ 2nk ¼  sin 4cr sin d tan2 a sin2 a
1  sin 2cr cos d
ð
Þ2
:
(13.11)
*13.1.3. Differential Reﬂectometry
The information gained by differential reﬂectometry is somewhat different
from that obtained by the aforementioned techniques. A “differential
Figure 13.4. Vector diagram of light reﬂected from a metal surface. The vectors having solid
arrowheads give the vibrational direction and magnitude of the light.
13. Applications
263



--- Page 277 ---

reﬂectogram” allows the direct measurement of the energies that elec-
trons absorb from photons as they are raised into higher allowed energy
states. The differential reﬂectometer measures the normalized difference
between the reﬂectivities of two similar specimens which are mounted side
by side (Fig. 13.5). For example, one specimen might be pure copper and the
other copper with, say, 1% zinc. Unpolarized light coming from a mono-
chromator is alternately deﬂected under near-normal incidence to one or the
other sample by means of a vibrating mirror. The reﬂected light is electroni-
cally processed to yield DR/ R ¼ 2(R1  R2)/(R1 þ R2). A complete differ-
ential reﬂectogram, i.e., a scan from the near IR through the visible into the
near UV, is generated automatically and takes about two minutes. The main
advantage of differential reﬂectometry over conventional optical techniques
lies in its ability to eliminate any undesirable inﬂuences of oxides, deforma-
tions, windows, electrolytes (for corrosion studies), or instrumental para-
meters upon a differential reﬂectogram, owing to the differential nature of
the technique. No vacuum is needed. Thus, the formation of a surface layer
due to environmental interactions can be studied in situ. Finally, the data can
be taken under near-normal incidence.
Differential reﬂectometry belongs to a family of techniques, called mod-
ulation spectroscopy, in which the derivative of the unperturbed reﬂectivity
(or e2) with respect to an external parameter is measured. Modulation
techniques restrict the action to so-called critical points in the band
Figure 13.5. Schematic diagram of the differential reﬂectometer. (For clarity, the angle of
incidence of the light beam impinging on the samples is drawn larger than it is in reality.)
From R.E. Hummel, Phys. Stat. Sol. (a) 76, 11 (1983).
264
III. Optical Properties of Materials



--- Page 278 ---

structure, i.e., they emphasize special electron transitions from an essen-
tially featureless background. This background is caused by the allowed
transitions at practically all points in the Brillouin zone. Most modulation
techniques, such as differential reﬂectometry, wavelength modulation,
thermoreﬂectance, or piezoreﬂectance, are ﬁrst-derivative techniques
(Fig. 13.6(a)). In semiconductor research (Section 13.6) another modula-
tion technique, called electro-reﬂectance, is often used, which provides the
third derivative of R or e2. (It utilizes an alternating electric ﬁeld which is
applied to the semiconducting material during the reﬂection measurement.)
The third derivative provides sharper and more richly structured spectra
than the ﬁrst-derivative techniques (Fig. 13.6(b)). In a ﬁrst-derivative
modulation spectrum, the lattice periodicity is retained, the optical transi-
tions remain vertical and the inter-band transition energy changes with the
perturbation (see inset of Fig. 13.6(a)). In electromodulation, the formerly
sharp vertical transitions are spread over a ﬁnite range of initial and ﬁnal
momenta (see inset of Fig. 13.6(b)). A relatively involved line-shape
analysis of electroreﬂectance spectra eventually yields the interband tran-
sition energies.
We shall make use of reﬂection, absorption, and ﬁrst-derivative spectra in
the sections to come.
Figure 13.6. Schematic representation of (a) the ﬁrst derivative and (b) the third derivative
of an e2-spectrum. The equivalent interband transitions at a so-called M0 symmetry point are
shown in the inserts. Adapted from D.E. Aspnes, Surface Science 37, 418 (1973).
13. Applications
265



--- Page 279 ---

13.2. Optical Spectra of Pure Metals
13.2.1. Reﬂection Spectra
The spectral dependence of the optical properties of metals was described and
calculated in Chapter 11 by postulating that light interacts with a certain
number of free electrons and a certain number of classical harmonic oscilla-
tors, or equivalently, by intraband and interband transitions. In the present
section we shall inspect experimental reﬂection data and see what conclusions
can be drawn from these results with respect to the electron band structure.
Figure 13.7 depicts the spectral reﬂectivity for silver. From this diagram,
the optical constants (i.e., the real and imaginary parts of the complex
dielectric constant, e1 ¼ n2  k2 and e2 ¼ 2nk) have been calculated by
means of a Kramers–Kronig analysis (Section 13.1.1). Comparing Fig. 13.8
with Fig. 11.5 shows that for small photon energies, i.e., for E < 3.8 eV, the
spectral dependences of e1 and e2 have the characteristic curve shapes for
free electrons. In other words, the optical properties of silver can be
described in this region by the concept of free electrons. Beyond 3.8 eV,
however, the spectral dependences of e1 and e2 deviates considerably from
the free electron behavior. In this range, classical oscillators, or equiva-
lently, interband transitions, need to be considered.
Now it is possible to separate the contributions of free and bound electrons
in e1- and e2-spectra. For this, one ﬁts the theoretical e2 to the experimental
e2 curves in the low-energy region. The theoretical spectral dependence of
e2 is obtained by the Drude equation (11.27). An “effective mass” and the
damping frequency, n2, are used as adjustable parameters. With these
Figure 13.7. Reﬂectivity spectrum for silver. Adapted from H. Ehrenreich et al., IEEE
Spectrum 2, 162 (1965). # 1965 IEEE.
266
III. Optical Properties of Materials



--- Page 280 ---

parameters, the free electron part of e1 (denoted by ef
1) is calculated in the
entire spectral range by using (11.26). Next, ef
1 is subtracted from the experi-
mental e1, which yields the bound electron contribution, eb
1. Figure 13.9
Figure 13.8. Spectral dependence of e1 and e2 for silver. e1 and e2 were obtained from
Fig. 13.7 by a Kramers–Kronig analysis. Adapted from H. Ehrenreich et al., IEEE Spectrum 2,
162 (1965). # 1965 IEEE.
Figure 13.9. Separation of e1 for silver into ef
1 (free electrons) and eb
1 (bound electrons).
Adapted from H. Ehrenreich et al., IEEE Spectrum 2, 162 (1965). # 1965 IEEE.
13. Applications
267



--- Page 281 ---

depicts an absorption band thus obtained, which resembles a calculated
absorption band quite well (Fig. 11.9).
We now turn to the optical spectra for copper (Figs. 13.10 and 13.11). We
notice immediately one important feature: Copper possesses an absorption
band in the visible spectrum, which is, as already mentioned, responsible for
the characteristic color of copper. We deﬁned above a threshold energy at
which interband transitions set in. In copper, the threshold energy is about
2.2 eV (Fig. 13.11), which is assigned to the d-band ! EF transition near
the L-symmetry point. (This is marked by an arrow in Fig. 5.22.) Another
Figure 13.10. Reﬂectivity spectrum for copper. Adapted from H. Ehrenreich et al., IEEE
Spectrum 2, 162 (1965). # 1965 IEEE.
Figure 13.11. Spectral dependence of e1 and e2 for copper. e1 and e2 were obtained from
Fig. 13.10 by a Kramers–Kronig analysis. Adapted from H. Ehrenreich et al., IEEE Spectrum
2, 162 (1965). # 1965 IEEE.
268
III. Optical Properties of Materials



--- Page 282 ---

peak is observed at slightly above 4 eV, which is ascribed to interband
transitions from the Fermi energy near the L-symmetry point, as depicted in
Figs. 12.3 and 5.22.
As a ﬁnal example, we inspect the reﬂection spectrum of aluminum.
Figures 13.12 and 13.13 show that the spectral dependences of e1 and
e2 resemble those shown in Fig. 11.5, except in the small energy region
around 1.5 eV. Thus, the behavior of aluminum may be described essen-
tially by the free electron theory. This free electron-like behavior of alumi-
num can also be deduced from its band structure (Fig. 5.21), which has
essential characteristics of free electron bands for fcc metals (Fig. 5.20).
Interband transitions which contribute to the e2-peak near 1.5 eV occur
Figure 13.12. Reﬂection spectrum for aluminum. Adapted from H. Ehrenreich et al., IEEE
Spectrum 2, 162 (1965). # 1965 IEEE.
Figure 13.13. Spectral dependence of e1 and e2 for aluminum. Adapted from H. Ehrenreich
et al., IEEE Spectrum 2, 162 (1965). # 1965 IEEE.
13. Applications
269



--- Page 283 ---

between the W20 and W1 symmetry points and the closely spaced and almost
parallel S3 and S1 bands. A small contribution stems from the W3 ! W1
transition near 2 eV.
*13.2.2. Plasma Oscillations
We postulate now that the free electrons of a metal interact electrostatically,
thus forming an electron “plasma” that can be excited by light of proper
photon energy to collectively perform ﬂuid-like oscillations. These plasma
oscillations are quantized. One quantum of plasma oscillations is called
a “plasmon”. This plasma possesses, just as an oscillator, a resonance
frequency, often called the plasma frequency. We already introduced in
Section 11.2 the plasma frequency, n1, and noted that the dielectric constant,
^e, becomes zero at n1. Thus, (10.12) reduces to
^e ¼ e1  ie2 ¼ 0;
(13.12)
from which we conclude that at the plasma frequency e1 as well as e2 must
be zero. Experience shows that oscillations of the electron plasma already
occur when e1 and e2 are close to zero.
The frequency dependence of the imaginary part of the reciprocal dielectric
constant peaks at the plasma frequency, as we will see shortly. We write
1
^e ¼
1
e1  ie2
¼ e1 þ ie2
e2
1 þ e2
2
¼
e1
e2
1 þ e2
2
þ i
e2
e2
1 þ e2
2
:
(13.13)
The imaginary part of the reciprocal dielectric constant, i.e.,
Im 1
^e ¼
e2
e2
1 þ e2
2
;
(13.14)
is called the “energy loss function” which is large for e1 ! 0 and e2 < 1,
i.e., at the plasma frequency. We will now inspect the energy loss functions
for some metals. We begin with aluminum because its behavior may well be
interpreted by the free electron theory. We observe in Fig. 13.14 a pro-
nounced maximum of Im 1 ^e
=
ð
Þ near 15.2 eV. The real part of the dielectric
constant (e1) is zero at this frequency and e2 is small (see Fig. 13.13). Thus,
we conclude that aluminum has a plasma resonance at 15.2 eV.
Things are slightly more complicated for silver. Here, the energy loss
function has a steep maximum near 4 eV (Fig. 13.15), which cannot be
solely attributed to free electrons, since ef
1 is only zero at 9.2 eV (see
Fig. 13.9). The plasma resonance near 4 eV originates by cooperation of
the d- as well as the conduction electrons. The loss function for silver
has another, but much weaker, resonance near 7.5 eV. This maximum is
essentially caused by the conduction electrons, but is perturbed by interband
transitions which occur at higher energies.
270
III. Optical Properties of Materials



--- Page 284 ---

The reﬂection spectrum for silver (Fig. 13.7) can now be completely
interpreted. The sharp decrease in R near 4 eV by almost 99% within a
fraction of an electron volt is caused by a weakly damped plasma resonance.
The sudden increase, only 0.1 eV above the plasma resonance, takes place
because of interband transitions that commence at this energy. Such a
dramatic change in optical constants is unparalleled.
13.3. Optical Spectra of Alloys
It was demonstrated in the previous sections that knowledge of the spectral
dependence of the optical properties contributes to the understanding of the
electronic structure of metals. We will now extend our discussion to alloys.
Figure 13.14. Energy loss function for aluminum. Adapted from H. Ehrenreich et al., IEEE
Spectrum 2, 162 (1965). # 1965 IEEE.
Figure 13.15. Energy loss function for silver. Adapted from H. Ehrenreich et al., IEEE
Spectrum 2, 162 (1965). # 1965 IEEE.
13. Applications
271



--- Page 285 ---

Several decades ago, N.F. Mott suggested that when a small amount of
metal A is added to a metal B, the Fermi energy would simply assume an
average value, while leaving the electron bands of the solvent intact. It was
eventually recognized, however, that this “rigid-band model” needed some
modiﬁcation and that the electron bands are somewhat changed for an alloy.
We use copper–zinc as an example. Figure 13.16 shows a series of differen-
tial reﬂectograms (see Section 13.1.3) from which the energies for interband
transitions, ET, can be taken. Peak A represents the threshold energy for
interband transitions, which can be seen to shift to higher energies with
increasing zinc content. ET is plotted in Fig. 13.17 as a function of solute
(X). Essentially, a linear increase in ET with increasing X is observed. The
threshold energy for copper has been identiﬁed in Section 12.2 to be
associated with electron transitions from the upper d-band to the conduction
band, just above the Fermi surface (see Fig. 12.3). The rise in energy
difference between the upper d-band and Fermi level, caused by solute
Figure 13.16. Experimental differential reﬂectograms for various copper–zinc alloys. The
parameter on the curves is the average zinc concentration of the two alloys in at.%. The curve
marked 0.5%, e.g., resulted by scanning the light beam between pure copper and a Cu–1% Zn
alloy. Peaks A and D are designated as e2-type structures (Fig. 11.10) whereas features B and
C belong to an e1-type structure (Fig. 11.9). From R.J. Nastasi-Andrews and R.E. Hummel,
Phys. Rev. B 16, 4314 (1977).
272
III. Optical Properties of Materials



--- Page 286 ---

additions, can be explained in a ﬁrst approximation by suggesting a rise
in the Fermi energy which results when extra electrons are introduced into
the copper matrix from the higher-valent solute. Gallium, which has three
valence electrons, would thus raise the Fermi energy more than zinc, which
is indeed observed in Fig. 13.17. The slope of the ET ¼ f(X) curve in
Fig. 13.17 for zinc (as well as for other solutes) is considerably smaller
than that predicted by the rigid band model. This suggests that the d-bands
are likewise raised with increasing solute content and/or that the Fermi level
is shifted up much less than anticipated. Band calculations substantiate this
suggestion. They reveal that upon solute additions to copper, the d-bands
become narrower (which results from a reduction in Cu–Cu interactions)
and that the d-bands are lifted up as a whole. Furthermore, the calculations
show that solute additions to copper cause a rise in EF and a downward shift
of the bottom of the s-band. Figure 13.18 reﬂects these results. Because of
the lowering of the bottom of the s-band (G1 in Fig. 5.22), the Fermi energy
rises much less than predicted had EG1 remained constant.
An unexpected characteristic of all ET ¼ f (X) curves is that the threshold
energy for interband transitions, ET, does not vary appreciably for solute
concentrations up to slightly above 1 at.% (Fig. 13.17). Friedel predicted
just this type of behavior and related it to “screening” effects. He argued that
for the ﬁrst few atomic percent solute additions to copper, the additional
charge from the higher-valent solute is effectively screened and the copper
matrix behaves as if the impurities were not present. The matrix remains
essentially unperturbed as long as the impurities do not mutually interact.
The differential reﬂectograms shown in Fig. 13.16 suggest two additional
pieces of structure, one of which corresponds to feature ‘D’ near 5 eV and is
Figure 13.17. Threshold energies, ET, for interband transitions for various copper-based
alloys as a function of solute content. The ET values are taken from differential reﬂectograms
similar to those shown in Fig. 13.16. The rigid band line (R.B.) for Cu–Zn is added for
comparison. From R.J. Nastasi-Andrews and R.E. Hummel, Phys. Rev. B 16, 4314 (1977).
13. Applications
273



--- Page 287 ---

assigned to electron transitions from the lower d-bands to the Fermi surface.
This interband transition is not shown in Fig. 13.18 because of its large
energy, which is beyond the scale of this ﬁgure. An ET versus X plot for peak
‘D’ resembles Fig. 13.17.
The third transition in the chosen energy region occurs at about 4 eV and
involves the structural features ‘B’ and ‘C’. The associated transition energy
is seen to decrease with increasing solute content (Fig. 13.19). Features ‘B’
Figure 13.18. Schematic band structure near L for copper (solid lines) and an assumed dilute
copper-based alloy (dashed lines). Compare with Figs. 12.3 and 5.22.
Figure 13.19. Energy of peak B for various dilute copper-based alloys. From R.J. Nastasi-
Andrews, and R.E. Hummel, Phys. Rev. B 16, 4314 (1977).
274
III. Optical Properties of Materials



--- Page 288 ---

and ‘C’ are ascribed to transitions near the L-symmetry point, originating
near the Fermi energy and terminating at the conduction band. It can be seen
in Fig. 13.18 that the transition energy just mentioned is smaller for copper-
based alloys than for pure copper, quite in agreement with the experimental
ﬁndings. The reader is asked at this point to compare Figs. 13.10 and 13.11
with Fig. 13.16 and see how different optical techniques complement each
other in revealing the electronic structure of solids.
*13.4. Ordering
It was shown in Section 7.5.3 that the resistivity decreases when solute
atoms of an alloy are periodically arranged on the regular lattice sites. Thus,
we conclude that ordering has an effect on the electronic structure and hence
on the optical properties of alloys. The best way to study ordering is to
compare two specimens of the same alloy when one of them is ordered and
the other is in the disordered state. This way, peaks occur in a differential
optical spectrum whenever the ordered state causes extra interband transi-
tions comparable to superlattice lines in X-ray spectroscopy. As an example,
Fig. 13.20 depicts an optical spectrum for the intermetallic phase Cu3Au.
We note several transitions, among them an e2-type structure with a peak
energy at 2.17 eV and an e1-type structure with a transition energy around
3.6 eV (median between 3.29 eV and 3.85 eV, see Fig. 11.9). We shall
explain them by referring to Fig. 13.21, which depicts the ﬁrst Brillouin
zone of the disordered fcc lattice in which a simple cubic Brillouin zone,
representing the superlattice, is inscribed. The G  X direction of the
fcc Brillouin zone is bisected by the face of the cubic Brillouin zone at
the point X. The point X is then thought to be folded back to the point G.
Figure 13.20. Differential reﬂectogram of (long-range) ordered versus disordered Cu3Au.
From R.E. Hummel, Phys. Stat. Sol. (a) 76, 11 (1983).
13. Applications
275



--- Page 289 ---

A new transition from the d-bands (e.g., at G12) to the point X40 (unfolded)
can now take place (see Fig. 5.22). Folding along G  M  K, and possibly
along other directions, explains the other transitions.
Short-range ordering shows comparatively smaller effects than long-
range ordering (Fig. 13.22). The reﬂectivity difference between ordered
and disordered alloys is about 3% for long-range ordering compared
to 0.5% in the case of short-range ordering. Still, even in the latter case,
a superlattice transition is observed, which is attributed to the periodic
arrangement of solute atoms in small domains (about 1–2 nm in diameter).
Figure 13.21. First Brillouin zone of an fcc lattice with inscribed Brillouin zone representing
a cubic primitive superlattice.
Figure 13.22. Differential reﬂectogram of (short-range) ordered versus disordered Cu–17 at.
% Al. From J.B. Andrews, R.J. Andrews, and R.E. Hummel, Phys. Rev. B 22, 1837 (1980).
276
III. Optical Properties of Materials



--- Page 290 ---

Interestingly enough, optical investigations provide a further piece of
information, which enables us to look upon the short-range ordered state
from a different perspective. It has been observed that certain peaks in a
differential reﬂectogram shift due to ordering, exactly as they would do
when a solute is added to a solvent (see Section 13.3). From this we
conclude that in the short-range ordered state, the interaction between
dissimilar atoms is slightly larger than that for similar atoms.
*13.5. Corrosion
Studies of the optical properties have been used for many decades for the
investigation of environmentally induced changes of surfaces. Optical stud-
ies are nondestructive, simple, and allow the investigation of oxides during
their formation. No vacuum is required, in contrast to many other surface
techniques. We use as an example the electrochemical corrosion of copper
in an aqueous solution. A copper disc is divided into two parts that are
electrically insulated from each other by a thin polymer ﬁlm. One half is
held electrically at the protective potential (as reference) and the other at the
corrosion potential. No artifacts from the electrolyte, the corrosion cell
window, or the metal substrate are experienced since the only difference
in the light path of a differential reﬂectometer is the corrosion ﬁlm itself.
Figure 13.23 depicts a series of differential reﬂectograms demonstrating
Figure 13.23. Differential reﬂectograms depicting the in situ evolution of Cu2O on a copper
substrate in a buffered electrolyte of pH 9. One sample half was held potentiostatically
at 200 mV (SCE) for various times, the other at the protective potential (500 mV (SCE)).
From R.E. Hummel, Phys. Stat. Sol. (a) 76, 11 (1983).
13. Applications
277



--- Page 291 ---

the evolution of Cu2O on a copper substrate. We observe that the peak
height near 3.25 eV, and thus the corrosion ﬁlm thickness, initially grows
rapidly. The growth rate slows down as the ﬁlm becomes thicker. The
growth kinetics has been observed to obey a logarithmic relationship.
13.6. Semiconductors
Intrinsic semiconductors have, at low temperatures, a completely ﬁlled
valence band and an empty conduction band (see Chapter 8). Consequently,
no intraband transition, or classical infrared (IR) absorption, is possible at
low temperatures. Thus, the optical behavior of an intrinsic semiconductor
is similar to that of an insulator, i.e., it is transparent in the low energy (far
IR) region. Once the energy of the photons is increased and eventually
reaches the gap energy, then the electrons are excited from the top of the
valence band to the bottom of the conduction band. The semiconductor
becomes opaque like a metal (see Fig. 13.24). The onset for interband
transitions is thus determined by the gap energy, which characteristically
has values between 0.2 eV and 3.5 eV (see Table 8.1 and Appendix 4). The
corresponding wavelength lies in the near IR or visible region.
The reader certainly knows from Chapter 8 that silicon is the most
important semiconductor material. It is therefore quite appropriate at this
point to look at the absorption spectrum of Si, Fig. 13.25. The situation is,
however, not as simple as just explained, because Si is a so-called “indir-
ect–band gap material”. By inspecting its band diagram (see Fig. 5.23 or
Fig. 13.26) we notice that the maximum of the valence band and the
minimum of the conduction band are not at the same point in k-space.
Figure 13.24. Schematic representation of the absorption spectrum of an intrinsic, direct–band
gap semiconductor. The material is transparent below the gap energy and opaque above Eg.
278
III. Optical Properties of Materials



--- Page 292 ---

Vertical transitions are thus not permissible (or have only a very small
probability) at energies below about 3.4 eV. Accordingly, we observe in
the optical spectrum depicted in Fig 13.25 three distinct absorption peaks,
which are known by the designations L3
0 ! L1 (3.4 eV), S (4.2 eV), and
L3
0 ! L3 (5.6 eV) (see Fig. 5.23). These peaks are all caused by direct
interband transitions in speciﬁc areas of k-space.
Figure 13.25. Differential reﬂectogram of silicon (after R.E. Hummel and W. Xi). DR/ R is
essentially the absorption, e2, as explained in Section 13.1.3. Compare to Fig. 5.23.
Figure 13.26. Schematic representation of direct versus indirect interband absorptions in Si.
In the case of an indirect transition, a phonon needs to be additionally absorbed. Compare to
Fig. 5.23 and 12.2.
13. Applications
279



--- Page 293 ---

Nevertheless, indirect transitions between the top of the valence band
and the bottom of the conduction band may be possible to a limited degree
provided the necessary momentum (wave vector k) is furnished by a
phonon (see Fig. 13.26). We have already discussed phonon-assisted
transitions in Section 12.2 and explained there that indirect interband
transitions are particularly observed in the absence of direct transitions.
Indirect interband transitions are generally quite weak.
Our discussion of the optical spectra of semiconductors is not complete
by considering only direct or indirect interband transitions. Several other
absorption mechanisms may occur. It has been observed, for example, that
the absorption spectra for semiconductors show a structure for photon
energies slightly below the gap energy (Fig. 13.27(a)). Frenkel explained
this behavior by postulating that a photon may excite an electron so that it
remains in the vicinity of its nucleus, thus forming an electron–hole pair,
called an exciton. Electrons and holes are thought to be bound together
by electrostatic forces and revolve around their mutual center of mass.
The electrons may hop through the crystal and change their respective
partners. This motion can also be described as an exciton wave. One depicts
the excitons by introducing “exciton levels” into the forbidden band
(Fig. 13.27(b)). They are separated from the conduction band by the “bind-
ing energy”, Ex, whose position can be calculated by an equation similar to
(4.18a) (see also Problem 8/10):
Ex ¼ 
me4
4pe0
ð
Þ22n2\2e2 ;
(13.15)
Exciton
absorption
Absorption
by interband
transitions
Eg
1.2
1.1
1.0
0.9
0.8
0.7
0.6
0
1.50
1.52
1.54
1.56
E(ev)
(a)
(b)
a in 104 cm–1
Valence
Band
Conduction
Band
Ex
Eg
E
0
Exciton
levels
n = 3
n = 2
n =1
Figure 13.27. (a) Spectral dependence of the absorbance, a, (10.21a) for gallium arsenide at
21 K. Adapted from M.D. Sturge, Phys. Rev. 127, 768 (1962). (b) Schematic representation
of exciton energy levels and an exciton in a semiconductor (or insulator).
280
III. Optical Properties of Materials



--- Page 294 ---

where n is an integer, m* is the effective mass of the exciton (which is the
average of me and mh), and e is the a.c. dielectric constant. Ex is characteris-
tically about 0.01 eV. The exciton levels are broadened by interactions with
impurities or phonons.
Finally, extrinsic semiconductors have, as we know, donor or acceptor
states near the conduction or the valence band, respectively (Section 8.3).
At sufﬁciently high temperatures, optical transitions from and to these states
can take place, which also cause weak absorption peaks below the gap energy.
It should be noted that the temperature slightly inﬂuences the absorption
characteristics of a semiconductor. The change in gap energy is about
2  104 eV/K (see Appendix, and Equation (8.1)), which stems from
an apparent broadening of valence and conduction levels with increasing
temperature due to transitions with simultaneous emission and absorption of
photons. Another temperature-enhanced effect should be considered, too.
Once electrons have been excited from the valence into the conduction band
(either by photons or thermal excitation), holes are present in the upper part
of the valence bands. Then, photons having energies well below Eg can be
absorbed by intraband transitions. These transitions are, however, relatively
weak.
High resistant semiconductors are extensively used for photoresistors
or photoconductors. In short, certain materials such as cadmium sulﬁde
(CdS), Lead sulﬁde (PbS), indium antimonide (InSb), or Ge:Cu become
more conductive when light (or g-rays) impinge on them. As we learned
above, high energy radiation raises some electrons across the band gap into
the conduction band leaving holes in the valence band, thus increasing
conductivity. For extrinsic semiconductors smaller energies are needed to
raise electrons from the impurity levels, making these materials useful
already in the IR region. Photoconductors are used for street light switches,
motion detectors, camera light meters, certain clock radios, alarms, and for
photocopying, see Section 9.4.1.
Optical absorption measurements are widely used in semiconductor
research since they provide the most accurate way to determine the gap
energies and the energies of the localized states. Measurements are normally
performed at low temperatures so that the thermal excitations of the electrons
do not mask the transitions to be studied. Optical measurements are capable
of discriminating between direct and indirect transitions, based on the mag-
nitude of the absorption peaks.
13.7. Insulators (Dielectric Materials and Glass Fibers)
As we know, insulators are characterized by completely ﬁlled valence bands
and empty “conduction” bands. Thus, no intraband transitions, i.e., no
classical IR absorption, takes place. Furthermore, the gap energy for
13. Applications
281



--- Page 295 ---

insulators is fairly large (typically 5 eV or larger) so that interband transi-
tions do not occur in the IR and visible spectrum either. They take place,
however, in the ultraviolet (UV) region. Third, excitons may be created,
which cause absorption peaks somewhat below the gap energy. For exam-
ple, the lowest energy for an exciton level (and thus for the ﬁrst exciton
absorption peak) for NaCl has been found to be at about 7 eV, i.e., in the
vacuum UV region. (Other alkali halides have very similar exciton ener-
gies.) We suspect, therefore, that insulators are transparent from the far IR
throughout the visible up to the UV region. This is indeed essentially
observed. However, in the IR region a new absorption mechanism may
take place which we have not yet discussed. It is caused by the light-induced
vibrations of the lattice atoms, i.e., by the excitation of phonons by
photons. We need to explain this in some more detail.
Let us ﬁrst consider a monatomic crystal (one kind of atom). The
individual atoms are thought to be excited by light of appropriate frequency
to perform oscillations about their points of rest. Now, the individual atoms
are surely not vibrating independently. They interact with their neighbors,
which causes them to move simultaneously. For simplicity, we model the
atoms to be interconnected by elastic springs, see Fig. 13.28. Thus, the
interaction of light with the lattice can be mathematically represented in
quite a similar manner to the one used when we discussed and calculated the
classical electron theory of dielectric materials. (In Section 11.6 we repre-
sented one atom in an electric ﬁeld as consisting of a positively charged core
which is bound quasi-elastically to an electron.) A differential equation
similar to (11.32) may be written for the present case as
m d2x
dt2 þ g0 dx
dt þ kx ¼ eE 0 exp iot
ð
Þ;
(13.16)
which represents the oscillations of atoms under the inﬂuence of light whose
excitation force is e E 0 exp(iot). As before, the factor k · x is the restoring
force that contains the displacement x and an interatomic force constant k
(i.e., a “spring constant,” or a “binding strength” between the atoms).
Figure 13.28. One-dimensional representations of possible vibration modes of atoms that
have been excited by IR electromagnetic radiation (heat). Left: stretching mode, right:
bending mode.
282
III. Optical Properties of Materials



--- Page 296 ---

The damping of the oscillations is represented by the second term in (13.16).
Damping is thought to be caused by interactions of the phonons with lattice
imperfections, or with external surfaces of the crystal, or with other pho-
nons. The oscillators possess one or several resonance frequencies o0,
which depend on the mass of the atoms on the vibrational modes (see
Fig. 13.28), and on the restoring force (see (11.34)). The solution of the
differential equation (13.16) yields a spectral dependence of e1 and e2 that
is very similar to that shown in Figs. 11.9–11.12.
The situation becomes slightly more complicated when diatomic solids,
such as ionic crystals, are considered. In this case, two differential equations
of the type of (13.16) need to be written. They have to be solved simulta-
neously. Actually, one needs to solve 2N coupled differential equations,
where N is the number of unit cells in the lattice. The result is, however,
qualitatively still the same. The resonance frequency for diatomic crystals is
o0 ¼ 2k
1
m1
þ 1
m2

;
(13.17)
where m1 and m2 are the masses of the two ion species. Figure 13.29 depicts
the spectral reﬂectivity of NaCl in the IR. Sodium chloride is transmissive
between 0.04 eV and 7 eV. At the upper boundary energy, exciton absorp-
tion sets in.
Fused quartz (depending on the method of manufacturing) is essentially
transparent between 0.29 eV and 6.9 eV (4.28 mm and 0.18 mm), having,
however, two pronounced absorption peaks near 1.38 mm and 2.8 mm, and a
minor peak near 1.24 mm. Window glass has a similar transmission spectrum
as fused quartz, with the exception that its UV cut-off wavelength is already
near 0.38 mm (3.3 eV). In recently developed sol–gel silica “glasses” the
absorption peaks near 1.38 mm and 2.8 mm are virtually suppressed, which
causes this material to be transparent from 0.16 mm to 4 mm. The energy loss
spectrum for the commercially important borosilicate/phosphosilicate
Figure 13.29. Spectral reﬂectivity of NaCl at room temperature in the far IR region.
13. Applications
283



--- Page 297 ---

glass, used for optical ﬁbers, is shown in Fig. 13.30. We notice the
aforementioned peaks near 1.38 mm and 1.24 mm, which are caused by
oscillations of OH ions, speciﬁcally, by stretching vibrations of the OH
bonds within the silica structure. The origin of these hydroxyl ions stems
from the fact that it is nearly impossible to exclude traces of water during
silica ﬁber production. The increase in energy loss above 1.6 mm is caused
by the stretching vibrations of the Si–O bonds. We shall refer to this
spectrum in Section 13.9.7.
A word should be added about the opacity of some dielectric materials,
such as enamels, opal glasses, glazes, or porcelains, which should be trans-
parent in the visible region according to our discussion above. This opacity is
caused by the scattering of light on small particles which are contained in the
matrix. Part of the light is diffusely transmitted and part of it is diffusely
reﬂected. The larger the specular part of the reﬂected light, the higher the
gloss. Very often, opaciﬁers are purposely added to a dielectric material to
cause wanted effects. The particle size should be nearly the same as the
wavelength of the light, and the index of refraction should be largely different
from that of the material, to obtain maximal scattering.
13.8. Emission of Light
13.8.1. Spontaneous Emission
So far we have discussed only the absorption of light by matter. We learned
that due to the interaction of photons with electrons, the electrons are
Figure 13.30. Energy loss spectrum of highly puriﬁed glass for ﬁber-optic applications
which features a phosphosilicate core surrounded by a borosilicate cladding. The communi-
cation channels near 1.3 mm and 1.5 mm are marked.
284
III. Optical Properties of Materials



--- Page 298 ---

excited into higher energy states. The present section deals with the emis-
sion of photons.
An electron, once excited, must eventually revert back into a lower,
empty energy state. This occurs, as a rule, spontaneously within a fraction
of a second and is accompanied by the emission of a photon and/or the
dissipation of heat, that is, phonons. The emission of light due to reversion
of electrons from a higher energy state is called luminescence. If the
electron transition occurs within nanoseconds or faster, the process is called
ﬂuorescence. In some materials, the emission takes place after microse-
conds or milliseconds. This slower process is referred to as phosphores-
cence. A third process, called afterglow, which is even slower (seconds),
occurs when excited electrons have been temporarily trapped, for example,
in impurity states from which they eventually return after some time into the
valence band.
Photoluminescence is observed when photons impinge on a material
which in turn re-emits light of a lower energy. Electroluminescing mate-
rials emit light as a consequence of an applied voltage or electric ﬁeld.
Cathodoluminescence, ﬁnally, is the term which is used to describe light
emission from a substance that has been showered by electrons of higher
energy. All of these effects have commercial applications. For example,
the inside walls of cathode ray picture tubes (CRT) for older television sets
and computers are coated with a cathodoluminescing material, basically
ZnS, which emits light when hit by electrons generated by a hot ﬁlament.
Silver-doped ZnS yields blue, and Cu-doping yields green colors. The
image generated in electron microscopes is made visible by a screen that
consists of such a “phosphor”. The same is true when X-rays or g-rays
need to be made visible. For completeness, it should be mentioned
that there is also bioluminescence which exists, however, only in living
(organic) materials.
Spontaneous light emission occurs also in common devices such as
candles or incandescent light bulbs. In both of these cases, the electrons
have been excited into higher energy states by heat energy (thermolumi-
nescence). The larger the temperature, the higher the energy of the photons
and the shorter their wavelength. For example, heating to about 700C
yields a dark red color whereas heating near 1600C results in orange
hues. At still higher temperatures, the emitted light appears to be white,
since large portions of the visible spectrum are emitted. Spontaneous emis-
sion possesses none of the characteristic properties of laser light: the radia-
tion is emitted through a wide-angle region in space; the light is phase
incoherent (see Section 13.8.2) and is often polychromatic (more than one
wavelength).
Because of the increased commercial importance of ﬂuorescence light
ﬁxtures and their considerably smaller energy consumption compared to
incandescence light bulbs (75% less power use, i.e. saving of about $30. –
over their lifetime) and their 10 times longer lifespan, a few words will be
13. Applications
285



--- Page 299 ---

promulgated to elucidate some relevant details. The design is in principal
straight-forward: A tubular ﬂuorescence light ﬁxture (often and wrongly
referred to as “neon light”) consists of a glass cylinder and two electrodes
(“pins”) on both ends, which are connected each to a tungsten ﬁlament
within the tube, see Fig. 13.31. The interior of the tube is ﬁlled with
low pressure mercury vapor. When the ﬁlament is lit, electrons are ejected
just as in an incandescent bulb which, when accelerated in an electric ﬁeld
between the two opposite electrodes, create a mercury glow discharge
(plasma), that in turn emits ultraviolet light. These UV photons are absorbed
by a phosphor deposited on the inside of the tube which, as a consequence,
emits visible light, as already mentioned above (photoluminescence). The
phosphors may consist of tungstates, silicates, halophosphates, metal sul-
ﬁdes (such as ZnS), oxides (such as ZnO having a surplus of Zn), and many
organic substances. More expensive phosphors are rare earth elements, such
as Eu3+ (red), Eu2+ (blue), or Tb. Since each phosphor emits only one color,
a mix of three or four phosphors are deposited to render the appearance of
“white light” or “warm light”. However, each added phosphor causes a loss
of efﬁciency and an increase in cost. The colors are labeled in Kelvins
ranging in color temperature between <3,000 K (warm white, or soft
white), via “bright white” (3,500 K), and “cool white” (4,000 K) to “day-
light” (> 5,000 K). In short, the higher the color temperature, the cooler
(bluer) the hue. The color rendering index (CRI) determines how accurate
the colors are perceived by the human eye. Sunlight is deﬁned to have a CRI
of 100.
The amount of light intensity (luminous ﬂux) a bulb is emitting is given in
lumens (and not in Watts). Replacing an incandescence bulb with a ﬂuores-
cent ﬁxture of same light output should be done in a 3:1 Watt ratio, in
particular since the latter ones dim during the time used. The light output of
ﬂuorescence lamps is essentially proportional to the surface area of the
phosphor which makes replacements of straight and long tubular light
ﬁxtures in standard incandescent sockets difﬁcult. This problem has been
overcome in compact ﬂuorescent lamps (CFL) for example by twisting the
tubes into a spiral array. This type is popular in North America. A folded T4
Figure 13.31. Schematic representation of a tubular ﬂuorescence light ﬁxture.
286
III. Optical Properties of Materials



--- Page 300 ---

tubular CFL in which several straight but connected tubes are arranged in
parallel, as used in European countries, is slightly more efﬁcient.
All currently available ﬂuorescent lights suffer from some inherent dis-
advantages. First, they are more expensive than incandescence light bulbs.
This is, however, compensated by the longer lifetime and the energy sav-
ings. Secondly, the lifespan is shortened if turned on and off frequently.
Third, they require some warm-up times (30 to 180 s) until the light has
reached its maximal output. Fourth, they need a “ballast”, that is, a control
device which limits the amount of current in the electrical circuit. The
commonly utilized electronic ballast (consisting of a small circuit board, a
rectiﬁer, a ﬁlter capacitor, and switching transistors) changes the frequency
from the standard 50 or 60 Hz to about 20,000 Hz and thus eliminates the
stroboscopic effect (ﬂicker) and the humming otherwise associated with
ﬂuorescing lighting in combination with old (magnetic) ballasts. The rapid
start ballast heats the ﬁlaments and simultaneously applies a high voltage
(about 600 V) between the electrodes. The electronic ballast is built into the
socket of CFLs whereas it is a separate device in tubular ﬂuorescence
ﬁxtures. Fifth, and most importantly, they contain mercury (average 4 mg,
but ranging from 1.4 to 30 mg depending in which country and on which
technology standard the device has been manufactured). This mercury is
released into the environment once the glass is broken (landﬁll) and is then
absorbed by the water and possibly by animals such as ﬁsh, destined for
human consumption. It is said, however, that during the use of a CFL, up to
86% of the mercury is absorbed and bound inside the light bulb. Moreover,
it has been calculated, that the mercury contained in coal and released by
coal-ﬁred electricity generating plants is reduced due to the diminished
power consumption saved by CFLs, so that a net reduction of released
mercury is in essence achieved. Research efforts to reduce the amount of
mercury, and increase the acceptance of ﬂuorescence light ﬁxtures even
further (see below) are in progress and have yielded to certain alloys, such as
Bi-Sn-Pb-Hg amalgams which operate, at higher temperatures to achieve
the necessary partial vapor pressure of Hg within the tube. As an example,
plain mercury lamps operate at about 50C whereas the above-mentioned
amalgam needs 100C, and newer proprietary “high temperature amalgams”
operate near 150C. Speciﬁcally, the optimal partial Hg pressure which
provides the highest light intensity ranges between 1–3 Pa. For Hg vapor
pressures which are too low, not enough Hg molecules are available which
can emit light. On the other hand, for an Hg vapor pressure that is too high,
some of the light quanta are immediately absorbed by some Hg molecules
and are therefore not available for lighting. A further piece of information
has to be considered too: The temperature of a ﬂuorescence light bulb
decisively depends on the distance between the two electrodes. In particular,
the closer the electrodes, the higher the temperature of the device. In order to
achieve small light ﬁxtures (as known from incandescence lights which may
13. Applications
287



--- Page 301 ---

be more acceptable to consumers) the operating temperature necessarily
increases which requires speciﬁc amalgams to be developed which allow an
Hg partial pressure in the above-mentioned 1–3 Pa range.
A ﬁnal word: It is often argued that if each household in the USA would
replace only one incandescent light bulb by a CFL, the energy saved would
be enough to light three million homes. For this reason, European countries
are gradually phasing out the sale of standard incandescent light bulbs
whose efﬁciency is only about 2–4%. It is estimated that presently about
9–20% of the electric energy consumed in a home is used for lighting.
Light-emitting diodes (LEDs) have recently gained substantial impor-
tance as electroluminescing devices whose efﬁciencies have also surpassed
those of incandescent lamps. They can be manufactured to emit light
throughout the entire visible spectrum. They are rugged, small and relatively
inexpensive, and will probably dominate the lighting market soon. We shall
devote Section 13.8.13 to this topic. Light-emitting devices for display
purposes will also be discussed in subsequent sections.
13.8.2. Stimulated Emission (Lasers)
A quite different type of light source is the laser, which is, among others,
used for telecommunications (optical ﬁber networks), data storage (compact
discs), laser printers, and grocery scanners. This section will explain how
lasers work.
Let us consider two energy levels, E1 and E2, and let us assume for a
moment that the higher energy level, E2, contains more electrons than the
lower level, E1, i.e., let us assume a population inversion of electrons
(Fig. 13.32(a)). We further assume that by some means (which we shall
discuss in a moment) the electrons in E2 are made to stay there for an
appreciable amount of time. Nevertheless, one electron will eventually
revert to the lower state. As a consequence, a photon with energy
E21 ¼ hn21 is emitted (Fig. 13.32(b)). This photon might stimulate a second
electron to descend in step to E1, thus causing the emission of another
photon which vibrates in phase with the ﬁrst one. The two photons are
consequently phase coherent (Fig. 13.32(c)). They might stimulate two
Figure 13.32. Schematic representation of stimulated emission between two energy levels,
E2 and E1. The dots symbolize electrons.
288
III. Optical Properties of Materials



--- Page 302 ---

more electrons to descend in step (Fig. 13.32(d)) and so on until an ava-
lanche of photons is created. In short, stimulated emission of light occurs
when electrons are forced by incident radiation to add more photons to an
incident beam. The acronym LASER can now be understood; it stands for
light ampliﬁcation by stimulated emission of radiation.
Laser light is highly monochromatic because it is generated by electron
transitions between two narrow energy levels. (As a consequence, laser light
can be focused to a spot less than 1 mm in diameter.) Another outstanding
feature of laser light is its strong collimation, i.e., the parallel emergence of
light from a laser window. (The cross-section of a laser beam transmitted to
the moon is only 3 km in diameter!) We understand the reason for the
collimation best by knowing the physical setup of a laser.
The lasing material is embodied in a long narrow container called the
cavity; the two faces at opposite ends of this cavity must be absolutely
parallel to each other. One of the faces is silvered and acts as a perfect
mirror, whereas the other face is partially silvered and thus transmits some
of the light (Fig. 13.33). The laser light is reﬂected back and forth by these
mirrors, thus increasing the number of photons during each pass. After the
laser has been started, the light is initially emitted in all possible directions
(left part of Fig. 13.33). However, only photons that travel strictly parallel
to the cavity axis will remain in action, whereas the photons traveling at
an angle will eventually be absorbed by the cavity walls (center part in
Fig. 13.33). A fraction of the photons escape through the partially transpar-
ent mirror. They constitute the emitted beam.
We now need to explain how the electrons arrive at the higher energy
level, i.e., we need to discuss how they are pumped from E1 into E2. One
of the methods is, of course, optical pumping, i.e., the absorption of light
stemming from a polychromatic light source. (Xenon ﬂashlamps for pulsed
lasers, or tungsten–iodine lamps for continuously operating lasers, are often
used for pumping. The lamp is either wrapped in helical form around the
cavity, or the lamp is placed in one of the focal axes of a specularly
reﬂecting elliptical cylinder, whereas the laser rod is placed along the
second focal axis.) Other pumping methods involve collisions in an electric
Figure 13.33. Schematic representation of a laser cavity and the buildup of laser oscillations.
The stimulated emission eventually dominates over the spontaneous emission. The light
leaves the cavity at the left side.
13. Applications
289



--- Page 303 ---

discharge, chemical reactions, nuclear reactions, or external electron beam
injection.
The pumping efﬁciency is large if the bandwidth, dE, of the upper (and
the lower) electron state is broad. This way, an entire frequency range
(rather than a single wavelength) leads to excited electrons (Fig. 13.34(a)).
Next, we discuss how population inversion can be achieved. For this we
need to quote Heisenberg’s uncertainty principle,
d E  d t / h;
(13.18)
which states that the time span, dt, for which an electron remains at the
higher energy level, E2, is large when the bandwidth, dE, of E2 is narrow. In
other words, a sharp energy level (dE small, dt large) supports the popula-
tion inversion, Fig. 13.34(b)). On the other hand, a large pumping efﬁciency
requires a large dE (Fig. 13.34(a)), which results in a small dt and a small
population inversion. Thus, high pumping efﬁciency and large population
inversion mutually exclude each other in a two-level conﬁguration. In
essence, a two-level conﬁguration as depicted in Fig. 13.34 does not yield
laser action.
The three-level laser (Fig. 13.35(a)) provides improvement. There, the
“pump band”, E3, is broad, which enables a good pumping efﬁciency.
The electrons revert after about 1014 s into an intermediate level, E2, via
a nonradiative, phonon-assisted process. Since E2 is sharp and not strongly
coupled to the ground state, the electrons remain much longer, i.e., for some
microseconds or even milliseconds on this level. This provides the required
population inversion.
An even larger population inversion is obtained using a four-level laser.
In this conﬁguration the energy level E2 is emptied rapidly by electron
transitions into a lower level, E1 (Fig. 13.35(b)). It should be added that
some three- and four-level lasers have several closely spaced pumping
bands, which, of course, increases the pumping efﬁciency.
Figure 13.34. Examples of possible energy states in a two-level conﬁguration. (a) dE large,
i.e., large pumping efﬁciency but little or no population inversion. (b) Potentially large
population inversion (dt large) but small pumping efﬁciency. (Note: Two-level lasers do not
produce a population inversion, because absorption and emission compensate each other).
290
III. Optical Properties of Materials



--- Page 304 ---

The highest population inversion is achieved by adding Q-switching. For
this method, the mirror in Fig. 13.33 is turned sideways during pumping to
reduce stimulated emission, i.e., to build up a substantial population inver-
sion. After some time, the mirror is turned back into its original vertical
position, which results in a burst of light lasting 10–20 ns.
Laser materials cannot be created at will in, say, three- or four-level
conﬁgurations. They can, however, be selected from hundreds of substances
to suit a speciﬁc purpose. Laser materials include crystals (such as ruby),
glasses (such as neodymium-doped glass), gases (such as helium, argon,
xenon), metal vapors (such as cadmium, zinc, or mercury), molecules (such
as carbon dioxide), or liquids (solvents which contain organic dye mole-
cules). Table 13.1 lists the properties of some widely used lasers. We
observe that many lasers emit their light in the red or IR spectrum. Excep-
tions are the He–Cd laser (l ¼ 325 nm), the argon laser (l ¼ 520 nm), the
tunable dye lasers, and certain semiconductor lasers. Lasers can be operated
in a continuous mode (CW), or, with a higher power output, in the pulsed
mode. The power output varies over many orders of magnitude and it can
even be increased if Q-switching is applied (speciﬁcally, from 109 to 1020
Watt). A few important laser types need special mention.
13.8.3. Helium–Neon Laser
A cavity about 2 mm in diameter is ﬁlled with 0.1 Torr Ne and 1 Torr He
(Fig. 13.36(a)). A current that passes through the gas produces free elec-
trons (and ions). The electrons are accelerated by the electric ﬁeld and
excite the helium gas by electron–atom collisions. Some of the helium
levels are resonant with neon levels so that the neon gas also becomes
excited by resonant energy transfer (Fig. 13.36(b)). This constitutes a very
efﬁcient pumping into the neon 2s- and 3s-levels. (Direct electron–neon
Figure 13.35. (a). Three-level laser. The nonradiative, phonon-assisted decay is marked by a
dashed line. Lasing occurs between levels E2 and E1. High pumping efﬁciency to E3. High
population inversion at E2. (b). Four-level laser.
13. Applications
291



--- Page 305 ---

collisions also contribute to the pumping). Lasing occurs between the neon
s- and p-levels and produces three characteristic wavelengths. Suppression
of two of the wavelengths is accomplished by multilayer dielectric mir-
rors, which provide a maximum reﬂectivity at the desired wavelength, or
by a Littrow prism, as shown in Fig. 13.36(a).
13.8.4. Carbon Dioxide Laser
The carbon dioxide laser is one of the most efﬁcient and powerful lasers
which is used in industry for cutting and welding. The active ingredients
contained in a CO2 laser tube consist of 10–20% carbon dioxide, 10–20%
nitrogen, and a few percent hydrogen. The remainder is helium. Pumping is
accomplished by electron–atom collisions (see above) setting the nitrogen
molecules into vibrational motions. This vibrational energy is then trans-
ferred to the carbon dioxide molecules by resonant energy transfer. The CO2
molecule possesses three fundamental modes of vibration, as shown in
Fig. 13.37(a). The lasing occurs between these levels as shown in
Fig. 13.37(b). The energy output, that is, the population inversion is greatly
improved by reversion of the vibrational modes to the ground state of cold
helium atoms (similar to Fig.13.35(b), see also Fig. 13.37(b)). This is
accomplished by water cooling the walls of the laser tube.
21s
23s
3s
2s
2p
3p
633nm
1150nm
3390nm
He
(a)
(b)
Ne
Figure 13.36. Helium–neon laser. (a) Schematic diagram of the laser cavity with Littrow
prism to obtain preferred oscillation at one wavelength. (The end windows are inclined at the
Brewster angle for which plane-polarized light suffers no reﬂection losses.) (b) Energy level
diagram for helium and neon. The decay time for the p-states is 10 ns; that of the s-states
100 ns. The letters on the energy levels represent the angular momentum quantum number;
the number in front of the letters gives the value for the principal quantum number; and the
superscripts represent the multiplicity (singlet, doublet, etc.), see Appendix 3.
292
III. Optical Properties of Materials



--- Page 306 ---

13.8.5. Semiconductor Laser
The “cavity” for this laser consists of heavily doped (1018 cm3) n- and
p-type semiconductor materials such as GaAs. The energy band diagram for
a p–n junction has been shown in Fig. 8.19 and is redrawn in Fig. 13.38(a)
for the case of forward bias. We notice a population inversion of electrons in
the depletion layer. Two opposite end faces of this p–n junction are made
parallel and are polished or cleaved along crystal planes. The other faces are
left untreated to suppress lasing in unwanted directions (Fig. 13.38(b)).
A reﬂective coating of the window is usually not necessary since the
reﬂectivity of the semiconductor is already 35%. The pumping occurs by
direct injection of electrons and holes into the depletion region. Semicon-
ductor lasers are small and can be quite efﬁcient.
Figure 13.37. CO2 laser. (a) Fundamental modes of vibration for a CO2 molecule; n1:
symmetric stretching mode; n2: bending mode; n3: asymmetric stretching mode. (b) Energy
level diagram for various vibrational modes.
Figure 13.38. (a) Energy band diagram of a heavily doped, forward-biased semiconductor.
(b) Schematic setup of a semiconductor laser.
13. Applications
293



--- Page 307 ---

Table 13.1. Properties of Some Common Laser Materials.
Type of laser
Wave-length(s)
(nm)
Beam
divergence
(mrad)
Peak power output (W)
Comments
Ruby (Cr3+-doped Al2O3)
694.3
10
CW:a  5
Optically pumped three- level laser.
5
pulsed (1–3 ms): 106–108
Lasing occurs between Cr3+ levels.
0.5
Q-switched (10 ns): 109
Low efﬁciency (0.1%). Historic device (1960).
Neodymium (Nd3+-doped
glass or YAGb)
1,064
3–8
CW: 103 pulsed (0.1–1 ms): 104
Optically pumped four- level laser. High
efﬁciency 2%.
HeNe
632.8
(1150; 3390)
1
10–3–10–2
See Fig. 13.36 and text. Most widely used.
HeCd (gas/metal vapor)
441.6
150 mW CW
Similarly pumped as HeNe laser. Used for high-speed
laser printers, and writing data on photoresists for
CD-ROMs. Efﬁciency: up to 0.02%.
325
100 mW
353.6
20 mW
Argon ion
488
25 CW
0.1% Efﬁciency
CO2
10,600;
2
CW: 103–1.5  105;
pulsed (Q-switched; 102–103 ns): 109
High efﬁciency (20%). Lasing occurs between
vibrational levels (Fig. 13.37).
9,600
Semiconductors
Homojunction, pulsed: (102 ns) 10–30
Heterojunction, CW: 1–4  10–1
Small size, direct conversion of electrical energy into
optical energy. 10–55% efﬁciency. See Figs. 13.38
and 13.43.
GaAs
870
250
GaAlAsc
850
500
Dye (organic dyes in
solvents)
350–1000
3
CW: 10–1
Lasing occurs between vibrational sublevels of
molecules.
Tunable by Littrow prism (Fig. 13.36(a)).
10
pulsed (6 ns)  105
aCW: Continuous wave.
bYttrium aluminum garnet (Y3Al2O15).
cSee Fig. 13.40.
294
III. Optical Properties of Materials



--- Page 308 ---

13.8.6. Direct–Versus Indirect–Band Gap Semiconductor Lasers
We need to discuss now whether or not all semiconducting materials are
equally well suited for a laser. Indeed, they are not. Direct–band gap materi-
als, such as GaAs, have a much higher quantum efﬁciency for the emission of
light than indirect–band gap materials, such as silicon. This needs some
explanation. Let us assume that an electron at the top of the valence band
in silicon has absorbed energy, and has thus been excited (pumped) by means
of a direct interband transition into the conduction band, as shown in
Fig. 13.39. This “hot” electron quickly thermalizes, i.e., it reverts down
within 1014 s to the bottom of the conduction band in a nonradiative
process, involving a phonon (to conserve momentum, see Section 12.2). In
order to recombine ﬁnally with the left-behind hole in the valence band (by
means of an indirect transition) a second phonon-assisted process has to take
place. This requirement substantially reduces the probability for emission.
The time interval which elapses before such a recombination takes place may
be as much as 0.25 s, which is substantially longer than it would take for a
direct recombination in a pumped semiconductor. Before this quarter of a
second has passed, the electron and also the hole have already recombined
through some other nonradiative means involving impurity states, lattice
defects, etc. Thus, the electron in question is lost before a radiative emission
occurs. This does not mean that indirect emissive transitions would never
take place. In fact, they do occur occasionally and have been observed, for
example, in GaP, but with a very small quantum efﬁciency. Indirect–band
gap semiconductors therefore seem to be not suited for lasers. It should be
added, however, that silicon, when made porous by anodically HF etching,
has been observed to emit visible light. It is speculated that the etching
creates an array of columns which act as ﬁne quantum lines, and thus alter
the electronic band structure of silicon to render it direct. Moreover, spark-
processed Si emits quite efﬁciently in the blue and green spectral range and is
Figure 13.39. Direct interband transition pumping (Ep) and phonon-involved reversion of a
hot electron by indirect transitions for an indirect–band gap semiconductor such as silicon.
(Compare with Figs. 5.23 and 12.2).
13. Applications
295



--- Page 309 ---

extremely stable against high temperatures, laser light, and HF etchings.
However, none of these Si-based materials have yielded a laser so far.
13.8.7. Wavelength of Emitted Light
The wavelength of a binary GaAs laser is about 0.87 mm. This is, however,
not the most advantageous wavelength for telecommunication purposes
because glass attenuates light of this wavelength appreciably. By inspecting
Fig. 13.30 we note that the optical absorption in glass is quite wavelength
dependent, having minima in absorption at 1.3 mm and 1.55 mm. Fortu-
nately, the band gap energy, i.e., the wavelength at which a laser emits light,
can be adjusted to a certain degree by utilizing ternary or quaternary
compound semiconductors (Fig. 13.40). Among them, In1  xGaxAsyP1  y
plays a considerable role for telecommunication purposes, because the
useful emission wavelengths of these compounds can be varied between
0.886 mm and 1.55 mm (which corresponds to gap energies from 1.4 eV to
0.8 eV). In other words, the above-mentioned desirable wavelengths of
1.3 mm and 1.55 mm can be conveniently obtained by utilizing a properly
designed indium– gallium–arsenide–phosphide laser.
Red lasers are quite common. They are widely used, for example in laser
printers, grocery scanners, and compact disc players. On the other hand,
blue semiconductor lasers have been more of a problem to fabricate. This
hurdle seems to have been partially overcome now by an InGaN laser that
emits at 399 nm. It involves a two-dimensional matrix of surface-emitting
lasers that are optically pumped at 367 nm by a nitrogen laser–pumped dye
laser. In other words, this laser does not yet emit blue light by merely
applying a voltage, as in the case of the red lasers.
Figure 13.40. Lattice constants, energy gaps, and emission wavelengths of some ternary and
quaternary compound semiconductors at 300 K. The lines between the binary compounds
denote ternaries. The cross-hatched lines indicate indirect interband transitions. Pure silicon
is also added for comparison.
296
III. Optical Properties of Materials



--- Page 310 ---

A note on compound semiconductor fabrication needs to be inserted
at this point. Semiconductor compounds are usually deposited out of the
gaseous or liquid phase onto an existing semiconductor substrate, whereby a
relatively close match of the lattice structure of substrate and layer has to be
maintained. This process, in which the lattice structure of the substrate
is continued into the deposited layer, is called “epitaxial growth.” The
important point is that, in order to obtain a strain-free epitaxial layer, the
lattice constants of the involved components have to be nearly identical.
Figure 13.40 shows, for example, that this condition is fulﬁlled for GaAs
and AlAs. These compounds have virtually identical lattice constants. A
near-perfect lattice match can also be obtained for ternary In0.53Ga0.47 As on
an InP substrate. In short, the critical parameters for designing lasers from
compound semiconductors include the band gap energy, the similarities of
the lattice constants of the substrate and active layer, the fact whether or not
a direct– band gap material is involved, and the refractive indices of the core
and cladding materials (see Section 13.8.9).
Finally, the emission wavelength depends on the temperature of opera-
tion, because the band gap decreases with increasing temperature (see
Equation (8.1) and Appendix 4) according to the empirical equation
EgT ¼ Eg0 
xT2
T þ yD
;
(13.19)
where Eg0 is the band gap energy at T ¼ 0 K, x 	 5  104 eV/K, and
yD is the Debye temperature (see Table 19.2 and Section 19.4), which
is 204 K for GaAs.
13.8.8. Threshold Current Density
A few more peculiarities of semiconductor lasers will be added to deepen
our understanding. Each diode laser has a certain power output characteris-
tic which depends on the input current density, as depicted in Fig. 13.41.
Applying low pumping currents results in predominantly spontaneous emis-
sion of light. The light is in this case incoherent and is not strongly
monochromatic, i.e., the spectral line width is spread over several hundred
A˚ ngstr€oms. However, when the current density increases above a certain
threshold, population inversion eventually occurs. At this point, the stimu-
lated emission (lasing) dominates over spontaneous emission and the laser
emits a single wavelength having a line width of about 1 A˚ . Above the
threshold the laser operates about one hundred times more efﬁciently than
below the threshold. The electric vector vibrates perpendicular to the length
axis of the cavity, i.e., the emitted light is plane-polarized. Additionally,
standing waves are formed within the laser, which avoids destructive
13. Applications
297



--- Page 311 ---

interference of the radiation. The distance between the two cavity faces must
therefore be an integer multiple of half a wavelength.
13.8.9. Homojunction Versus Heterojunction Lasers
Lasers for which the p-type and n-type base materials are alike (e.g., GaAs)
are called homojunction lasers. In these devices the photon distribution
extends considerably beyond the electrically active region (in which the
lasing occurs) into the adjacent inactive regions, as shown in Fig. 13.42.
Figure 13.41. Schematic representation of the power output of a diode laser versus the pump
current density. The threshold current density for a homojunction GaAs laser is on the order
of 104 A/cm2.
Figure 13.42. Schematic representation of the photon distribution in the vicinity of the
depletion layer of a homojunction diode laser.
298
III. Optical Properties of Materials



--- Page 312 ---

The total light-emitting layer, D, for GaAs is about 10 mm wide, whereas the
depletion layer, d, i.e., the active region, might be as narrow as 1 mm. The
photons that penetrate into the non-active region do not stimulate further
emission and thus reduce the quantum efﬁciency (which in the present case
is about 10%). In essence, some of these photons are eventually absorbed
(extinct) and thus increase the temperature of the laser. The homojunction
laser has therefore to be cooled or operated in a pulsed mode employing
bursts of 100 ns duration, allowing for intermittent cooling times as long as
102 s. This yields peak powers of about 10–30 W.
Cooling or pulsing is not necessary for heterojunction lasers in which,
for example, two junctions are utilized as depicted in Fig. 13.43. If the
refractive index of the active region is larger than that of the neighboring
areas, an “optical waveguide structure” is effectively achieved which con-
ﬁnes the photon within the GaAs layer (total reﬂection!). This way, virtually
no energy is extinct in the nonactive regions. The threshold current density
can be reduced to 400 A/cm2. The quantum efﬁciency can reach 55% and the
output power in continuous mode may be as high as 390 mW. The disadvan-
tage of a double heterojunction laser is, however, its larger angular diver-
gence of the emerging beam, which is between 20 and 40.
13.8.10. Laser Modulation
For telecommunication purposes it is necessary to impress an a.c. signal on
the output of a laser, i.e., to modulate directly the emerging light by, say,
the speech. This can be accomplished, for example, by amplitude modula-
tion, i.e., by biasing the laser initially above the threshold and then super-
imposing on this d.c. voltage an a.c. signal (Fig. 13.44). The amplitude of
the emerging laser light depends on the slope of the power–current charac-
teristic. Another possibility is pulse modulation, i.e., the generation of
Figure 13.43. Schematic representation of a double heterojunction laser in which the active
region consists of an n-doped GaAs layer.
13. Applications
299



--- Page 313 ---

subnanosecond pulses having nanosecond spacings between them. (For
digitalization, see Section 13.10.) This high-speed pulsing is possible
because of the inherently short turn-on and turn-off times (1010 s) of
semiconductor lasers when initially biased just below the threshold current
density. Finally, frequency modulation can be achieved by applying,
perpendicularly to the diode junction, a periodic varying mechanical pres-
sure (by means of a transducer), thus periodically altering the dielectric
constant of the cavity. This way, modulation rates of several hundred
megahertz have been achieved.
13.8.11. Laser Ampliﬁer
The laser can also function as an optical ampliﬁer, which is again used for
telecommunication purposes. A weak optical signal enters a laser through
one of its windows and there stimulates the emission of photons.
Figure 13.44. Amplitude modulation of a semiconductor laser: (a) input current–output
power characteristic; (b) circuit diagram. (The d.c. power supply has to be electrically
insulated from the a.c. source).
300
III. Optical Properties of Materials



--- Page 314 ---

The ampliﬁed signal leaves the other window after having passed the cavity
only once. This traveling-wave laser is biased slightly below the threshold
current in order to exclude spurious lasing not triggered by an incoming
signal. Nevertheless, some photons are always spontaneously generated,
which causes some background noise.
A new development is the erbium-doped ﬁber ampliﬁer, which works
quite similar to the above-mentioned traveling-wave laser. Erbium atoms,
contained in lengths of a coiled glass ﬁber, are pumped to higher energies by
an indium–gallium– arsenide–phosphide laser at a wavelength of 0.98 mm or
1.48 mm. When a weakened signal enters one end of this erbium-doped ﬁber,
the erbium atoms gradually transfer their energy to the incoming signal by
stimulated emission, thus causing ampliﬁcation. A mere 10 mW of laser
power can thus achieve a gain of 30–40 dB. Networks which include ﬁber
ampliﬁers, linked at certain distance intervals to cladded optical glass ﬁbers
(Fig. 13.30), have the potential of transmitting data at very high rates, e.g.,
2.5 gigabits of information per second over more than 20,000 km. This is
possible because ﬁbers are able to support a large (but ﬁnite) number of
channels. The advantage of erbium-doped optical ﬁbers is that they do not
interrupt the path of a light signal as conventional “repeaters” do (which
convert light into an electric current, amplify the current, and then trans-
form the electrical signal back into light).
13.8.12. Quantum Well Lasers
Quantum well lasers are the ultimate in miniaturization, as already dis-
cussed in Section 8.7.10. We have explained there that some unique proper-
ties are observed when device dimensions become comparable to the
wavelength of electrons. In essence, when a thin (20 nm wide) layer of a
small–band gap material (such as GaAs) is sandwiched between two large–
band gap materials (such as AlGaAs), a similar energy conﬁguration is
encountered as known for an electron in a box (Fig. 8.33). Speciﬁcally, the
carriers are conﬁned in this case to a potential well having “inﬁnitely” high
walls. Then, as we know from Section 4.2, the formerly continuous conduc-
tion or valence bands reduce to discrete energy levels, see Fig. 13.45.
The light emission in a quantum well laser occurs as a result of electron
transitions from these conduction band levels into valence levels. It goes
almost without saying that the line width of the emitted light is small in this
case, because the transitions occur between narrow energy levels. Further,
the threshold current density for lasing (Fig. 13.41) is reduced by one order
of magnitude, and the number of carriers needed for population inversion is
likewise smaller.
If a series of large–and small–band gap materials are joined, thus forming
a multiple quantum well laser, the gain is even further increased and
13. Applications
301



--- Page 315 ---

the stability of the threshold current toward temperature ﬂuctuations is
improved. The GaAs/GaAlAs combination yields an emission wavelength
somewhat below 0.87 mm, whereas InGaAsP quantum well lasers emit light
near 1.3 mm or 1.5 mm (depending on their composition). It appears to be
challenging to eventually fabricate quantum wire or quantum dot lasers (see
Section 8.7.10) which are predicted to have even lower threshold current
densities and higher modulation speeds.
13.8.13. Light-Emitting Diodes (LED)
Light-emitting diodes are of great technical importance as inexpensive,
rugged, small, and efﬁcient light sources. The LED consists, like the semi-
conductor laser, of a forward biased p–n junction. The above mentioned
special facing procedures are, however, omitted during the manufacturing
process. Thus, the LED does not operate in the lasing mode. The emitted
light is therefore neither phase coherent nor collimated. It is, of course,
desirable that the light emission occurs in the visible spectrum. Certain
III–V compound semiconductors, such as GaxAs1xP, GaP, GaxAl1xAs
Figure 13.45. Band structure of a single quantum dot structure. See in this context Sec-
tion 8.7.10 and Fig. 8.33(b).
302
III. Optical Properties of Materials



--- Page 316 ---

(for red and yellow-green) and the newly discovered nitride-based com-
pound semiconductors (for green and blue colors) fulﬁll this requirement.
Their emission efﬁciencies (measured in lumens per watt) are at par or
even better than those of unﬁltered incandescent light bulbs and are almost
one order of magnitude larger than certain color-ﬁltered tungsten-ﬁlament
lamps. All three basic colors necessary for covering the visible spectrum and
also the infrared (450–1,500 nm) are now available with adequate intensi-
ties. Because of these properties, the lighting industry is currently under-
going a revolution that will lead to LED-based large ﬂat-panel color
displays, bright outdoor color signs, better projection television, full-color
photographic printers, more efﬁcient and particularly durable trafﬁc lights,
and even changes in home and ofﬁce illumination.
In order to vividly demonstrate the spectral emission properties of LEDs
a chromaticity diagram as shown in Fig. 13.46 is helpful. It is based on
the peculiarities of the three types of cones in the human eye, which are
sensitive for either blue, green, or red radiation. (The corresponding wave-
lengths mark the corners of the chromaticity diagram). A given “color” is
represented by two parameters or percentages (x and y) in this graph, while
the percentage of the third color is the difference between x þ y and 100%.
Monochromatic light (such as from a laser) is depicted by a speciﬁc point on
the perimeter of the graph. Any other hue is created by mixing the basic
colors. When the spectral width of the light increases and the emission is
therefore less pure, the color coordinates move towards the center. As an
Figure 13.46. Chromaticity diagram in which the positions of some commercially available
LEDs are shown.
13. Applications
303



--- Page 317 ---

example, “white light”, that is, the broad emission spectrum of a black-body
radiator heated to very high temperatures (e.g., the sun), is described by a
point in this diagram at which x as well as y are about 33%.
Figure 13.46 displays the color coordinates of some of the presently
available electroluminescing compound semiconductors. Ga–N containing
about 8% In is depicted to provide blue (470 nm) light. This color changes
into green (520 nm) by adding successively larger amounts of indium to
GaN. Al–Ga–As yields red hues (700 nm) and yellow-green light is emitted
by Al–In–Ga–P (590 nm). Moreover, green- or blue-emitting LEDs, when
covered by one or more appropriate phosphors, (see Section 13.8.1) can be
made to vary their color according to the spectral emission of the phosphor.
White-radiating LEDs are obtained by exciting suitable phosphors by the
ultraviolet radiation from GaN. Alternatively, white-emitting LEDs are
obtained by adding blue and yellow LED light.
A few technical details on nitride-based semiconductors shall be added.
As mentioned above, LEDs require n-and p-type components to manufac-
ture a diode. Si in the form of silane (SiH4) is used for n-doping. On the other
hand, incorporating Mg, followed by low-energy electron radiation, or
thermal annealing (to activate the Mg-doped GaN) leads to p-type segments.
As already mentioned in Section 13.8.9 (Fig. 13.43), double hetero-
structures increase the output power of LEDs. Speciﬁcally, incorporating
Zn and Si dopants into an In–Ga–N active layer that is surrounded by
Al–Ga–N layers leads to output powers near 3 mW when the chip size is
3  3 mm2. Further, a peak wavelength of 450 nm, and an external quantum
efﬁciency of 5.4% (that is, the ratio of the number of photons produced to
the number of injected electrons) are obtained. Forward currents of typically
20 mA are generally applied.
The devices consisting of indium-gallium nitrides are commonly depos-
ited on sapphire (a-Al2O3) or silicon carbide (6H-SiC) substrates. Metal-
organic chemical vapor deposition at 700 to 1,100C, involving trimethyl
gallium (Ga(CH3)3) and ammonia (NH3) as gas sources, is generally used for
growing epitaxial GaN ﬁlms. InGaN is laid down by additions of trimethyl
indium. The devices are contacted and eventually encapsulated in epoxy
resins. The radiation leaves the device through a semitransparent metal
contact on the top or through a transparent n-GaN contact on the substrate.
In the case of GaAs, the light may leave the device through a window which
has been etched through the metallic contact (surface emitter).
The “lifetimes” of LEDs are extrapolated to be in excess of 50,000 hours,
or more precisely, the time after which the light intensity has decreased to
70% of its original value is approximately 30,000 hours. (This compares to
an average lifetime of 1,000 to 2,000 hours for a typical incandescent light
bulb.) The failures are generally caused by a break-down of the contacts or
the encapsulate, rather than of the semiconductor itself. The cost at present
is about one US dollar for a blue- or green-emitting diode and less than
10 cents for red and orange LEDs.
304
III. Optical Properties of Materials



--- Page 318 ---

A short note on other recently developed LED materials shall be added.
Blue-emitting SiC has been investigated for some time, but its efﬁciency
is orders of magnitude smaller than the above-described nitrides. This is
mainly due to its indirect–band gap characteristics. ZnSe (a II–VI com-
pound) has also blue and green emissions, but its lifetime is substantially
reduced by the formation of structural defects. LEDs based on polymers
with ionic materials as electron-injecting and hole-blocking layers have
been demonstrated. Finally, as a matter of curiosity, a “light-emitting
vegetable diode”, utilizing a pickle, has been reported in the literature to
emit yellow light (and an unpleasant smell).
13.8.14. Organic Light Emitting Diodes (OLEDs)
Organic light emitting diodes work in principal quite similar to inorganic
LEDs like gallium-arsenide-phosphide (or GaN) diodes as described in the
previous section. Speciﬁcally, electrons and holes are injected from opposite
sides (called cathode and anode, respectively) into a suitable organic mate-
rial where they combine to form electron/hole pairs (called excitons, see
Section 13.6) and then relax to the ground state by emitting photons. This is
shown schematically in Fig. 13.47(b). In order to obtain a high rate of hole
injection, and thus, a good light emitting efﬁciency, it is important to match
Metal
HOMO
LUMO
HOMO
LUMO
Eg
Eg
Metal
or ITO
EF
EF
Organic
Semiconductor
Organic
Semiconductor
Light
Light
Hole injection
Electron injection
(a)
(c)
(b)
Ionization Energy
AM
CM
Figure 13.47. Schematic representation of a single-layer organic light emitting diode. (a)
A metal “band diagram” adjacent to HOMO/LUMO levels of an organic semiconductor is
depicted. Hole injection is indicated. (b) Schematic functioning of a single layer OLED. (c)
HOMO/LUMO levels and metal “band diagram” for electron injection. HOMO ¼ highest
occupied molecular orbital; LUMO ¼ lowest unoccupied molecular orbital, see page 186.
ØAM ¼ Work function for an anode metal. ØCM ¼ Work function of a cathode metal;
Eg ¼ band gap energy, EF ¼ Fermi energy.
13. Applications
305



--- Page 319 ---

the work function of the anode (e.g. metal) electrode, ØAM, that is, the Fermi
energy, EF, (Fig. 8.13) with the HOMO level (Section 9.1) of the organic
semiconductor. This is schematically depicted in Fig. 13.47(a). Likewise,
a high efﬁciency of electron injection is achieved by matching the
LUMO level of the organic semiconductor with the work function of the
metal cathode, ØCM; see Fig. 13.47(c). The match between HOMO levels
and metals is generally easily achieved because of the high work function
of many metals; see the tables in Appendix 4. Likewise, many metal
oxides, such as transparent Indium-Tin-Oxide (ITO) or GaInO3 or ZnInSnO,
(see Section 9.3), have large work functions which are close to the HOMO
level of some organic semiconductors, such as diamine (Fig. 13.48(a)),
and are therefore used for anodes. On the other hand, metals which have
the required low work function, ØCM, to match with the LUMO level
(Fig. 13.47(c)) are often highly reactive and susceptible to corrosion under
the inﬂuence of moisture and oxygen.
A further point needs to be considered: Even if the number of injected
electrons and holes are the same, the mobilities of these carriers may still be
different (Appendix 4). This may lead to non-radiative recombination of
holes and electrons (near the interface between metals and organic semi-
conductors) and as a consequence, to a low light emitting efﬁciency and a
high driving voltage. Other device structures are therefore necessary, as
described momentarily.
An improvement is obtained by a double-layer OLED which consists,
for example, of a transparent ITO coating on a glass substrate as an anode, a
diamine ﬁlm for hole transport, tris(8-hydroxyquinoline) aluminum (Alq3)
as an electron transporting and light emitting layer, and ﬁnally a magne-
sium-silver alloy as a cathode, see Figures 13.48 and 13.49. As mentioned
above, the work function of ITO matches the HOMO level of the diamine
N
N
CH3
H3C
(b)
(a)
Figure 13.48. Chemical compounds for OLEDs. (a) N,N’,-diphenyl-N,N’-bis(3-methylphe-
nyl)-(1,1’-biphenyl)-4,4’-diamine (TPD) (b) Alq3 also known as tris(8-hydroxyquinoline)
aluminum having the formula Al(C9H6NO)3.
306
III. Optical Properties of Materials



--- Page 320 ---

which leads to an efﬁcient hole injection. On the other hand, the work
function of the (non-corrosive) magnesium-silver alloy is close to the
LUMO level of Alq3. This array increases the rate of carrier injections,
the carrier mobilities, and the device efﬁciency. Moreover, the operating
voltage may be reduced to below 10 V due to the total layer thickness of
about 200 nm. Since diamine provides a higher hole mobility compared to
the electron mobility in Alq3, while Alq3 provides a reasonably high elec-
tron mobility, the exciton formation takes place close to the diamine/Alq3
interface to yield green light. Other colors can be achieved by varying the
band gap of the emitter material.
The efﬁciency of an OLED can be further improved by utilizing multi-
layer devices. The principle of their built-up is quite similar to that shown in
Figure 13.47, consisting of anode (hole injection layer), hole transport layer,
light emitting zone, electron transport /electron injection layer, and cathode.
By proper materials selection, it is possible to design a device so that
the electron transport layer provides a high electron mobility (and the hole
transport layer provides a high hole mobility). Moreover, it is desirable that
one type of carrier is blocked in the transport layer of the opposite polarity.
For example, electrons should be allowed to freely diffuse in the electron
transport layer while the holes should be blocked there. This can be accom-
plished by proper band-gap engineering and materials selection.
Finally, OLEDs may be arranged in stacks which are electrically
connected in series. Each of the individual OLEDs can be made to emit a
different color which allows white emission. The individual units of these
tandem devices operate at lower current densities and reduced voltages.
(High current densities and operating voltages cause premature degradation
and lead to lower quantum efﬁciencies).
A few words should be added about the advantages (and disadvantages)
of OLEDs. Most of all, the technology for processing organics (for example
synthesizing and depositing on a substrate) is much less demanding com-
pared to inorganic LEDs. Speciﬁcally, polymers are frequently deposited
from a solution, such as by spin-coating from a solution, direct printing by
Glass substrate
ITO
Diamine
Alq3
Mg-Ag
Anode
Cathode
Light
(Hole transport layer)
(Electron transport layer)
Figure 13.49. Double-layer organic light emitting diode.
13. Applications
307



--- Page 321 ---

contact with stamps, or by ink-jet printing. Small molecules are vapor
deposited in vacuum, as is common for metals. This allows an easy tailoring
of properties of OLEDs to speciﬁc demands (color, driving voltage, lifetime,
etc.) as described above. Moreover, organic materials can be produced in the
form of ﬁlms which make them ﬂexible. On the other hand, the primary
problems of OLEDs are stability issues, speciﬁcally, degradation due to high
current densities, and corrosion of some electrode metals under the inﬂuence
of moisture and oxygen. Still, lifetimes (50% reduction of original intensity)
of up to 100,000 hours for red emitters (and even extrapolated lifetimes of
300,000 to 500,000 hours for red and green emitters) have been reported.
Considerable research in this ﬁeld with the goal of producing inexpensive
displays and lighting is presently being conducted. Indeed, OLED displays
are already available in various consumer products such as mobile phones,
MP3 players, digital cameras, auto radios, etc. Thus, the improvements
and further developments of OLEDs should be followed with considerable
anticipation.
13.8.15. Organic Photovoltaic Cells (OPVCs)
We interrupt now the description of light emitting devices and explain in
this section how organic solar cells are working. Elucidating OPVCs at this
point makes sense since we have already laid the ground for their under-
standing in the previous section. In short, the principal design of an organic
solar cell is quite similar to the OLED depicted in Figure 13.47. The
differences are, however, that the battery is replaced by a voltmeter or the
load and that the direction of the light is reversed. Additionally, the organic
materials are different in both devices, see below. Now, due to absorption of
photons by the organic semiconductor, electrons are excited across the band
gap from the HOMO levels (i.e. the delocalized p orbitals) into LUMO
levels (i.e. empty p* orbitals), thus creating bound electron/hole pairs, that
is, excitons, see page 186. Further, we recall by inspecting Fig. 13.47 that
the work functions, and thus, the Fermi energies in the two electrodes are
different. This creates an electric ﬁeld in the organic layer which breaks up
some of the electrostatic bonds (or, as chemist say, the excitonic binding
energy) between electrons and holes of the excitons and pulls the individual
carriers to the respective electrodes. Speciﬁcally, electrons run “downhill”
to the “anode” that is, in the present case, to the ITO, whereas holes “roll
upwards” to the metal electrode which may consist of Al, or Mg, or Ca.
As in the OLED case, a single layer organic photovoltaic device (made
of conjugated molecules or polymers, see Section 9.1 and Fig. 13.50), is
not very efﬁcient. This stems, among others, from the fact that the above
mentioned electric ﬁeld, generated by the two different types of electrodes,
is seldom high enough to completely break up the relatively strong
308
III. Optical Properties of Materials



--- Page 322 ---

electrostatic bonds of about 100 to 500 meV between electrons and holes of
the photon- generated excitons. Further, due to the relatively weak ﬁeld,
electrons and holes do not separate fast enough from each other and recom-
bine before they reach the electrodes. A double layer (heterojunction)
organic photovoltaic cell provides some improvement; see Figure 13.51(a).
The two layers in question consist of conjugated organics having dif-
ferent electron afﬁnity8 and ionization energies. In short, the electrostatic
forces generated at the interface between two properly selected organics of
Figure 13.50. Example of a conjugated organic molecule (phthalocyanine) used for organic
photovoltaic devices.
ITO
Electron
Donor
Electron
Acceptor
Metal
Electrode
Light
V
V
Metal
Electrode
(a)
(b)
Light
ITO
Dispersed
Hetero-
junction
Figure 13.51. Schematic representations of (a) a multilayer organic photovoltaic cell; (b) a
dispersed heterojunction OPVC.
8The electron afﬁnity of an atom (or molecule) is deﬁned to be the energy change which results
when a negative ion is formed by adding an electron to a neutral species. For example, chlorine
strongly attracts an extra electron to become a Cl ion.
13. Applications
309



--- Page 323 ---

different electron afﬁnity are signiﬁcantly stronger compared to a single
layer OPVC so that a more efﬁcient dissociation (breakup) of the excitons
is achieved. The layer which has the lower electron afﬁnity is called the
electron donor whereas the area with the higher electron afﬁnity is termed to
be the electron acceptor. (It should be noted that the terms donors and
acceptors are not identical with the dopants in Si technology).
The performance of OPVCs can be further improved by dispersed (bulk)
heterojunction solar cells. This enhancement is necessitated by knowing
that polymer layers need to be at least 100 nm thick in order to obtain
efﬁcient absorption of light. However, the maximal diffusion length of exci-
tons to the interface between organic layers may be only about 3–10 nm
before the individual carriers recombine and thus cease to contribute to
the solar energy collection. Thus, small electron donor domains and small
acceptor domains (several nm in size) are mixed together to ensure short
diffusion distances so that the excitons dissociate efﬁciently at the interfaces
of these domains before they recombine; see Fig. 13.51(b).
Finally, similar to OLEDs, the efﬁciency of organic solar cells can be
increased by stacking several OPVCs and connecting them in series to
optimize the absorption of the incident light.
As in OLEDs, advantages of organic solar cells are their low production
cost (utilizing spin coating or vapor deposition), mechanical ﬂexibility, light
weight, and high optical absorption coefﬁcients. Interestingly enough, near
infrared organic solar cells have been reported. However, disadvantages as
of this writing are low efﬁciencies (up to 8% power conversion, that is, about
1/3 of the efﬁciency of silicon-based solar cells), low stability, and low
strength. (The efﬁciency, that is, the light absorption can be improved by
stamping optical ﬁbers onto a polymer substrate that forms the foundation of
the cell which acts as light pipes.) Moreover, during spin coating some
solvents can degrade already existing layers. A further matter of concern
is the mobility of the charge carriers. Speciﬁcally, some of the carriers may
not reach the electrodes when their mobility is too low. Instead, they will
recombine at trap sites or stay in the device and oppose the drift of new
carriers, particularly if electron and hole mobilities are grossly different.
13.8.16. Liquid Crystal Displays (LCDs)
Many consumer products need to communicate the processed information to
their owners, such as in wrist watches, calculator read-outs, video cameras,
video recorders (VCRs), automobile dashboards, etc. Traditional cathode
ray tubes (CRTs) as known for TVs and many computer monitors are still
widely used. However, ﬂat-panel displays are rapidly gaining ground.
Among them, the liquid crystal display dominates with 85% this market,
having annual sales near 15 billion dollars world-wide. LCDs had a 75%
310
III. Optical Properties of Materials



--- Page 324 ---

market share of the 200 million TVs produced in 2010. LCDs are “non-
emissive devices”, that is, they do not emit light by themselves, but rather
depend on external illumination, as we will see momentarily.
LCDs contain peculiar viscous liquids whose rod-shaped molecules are
arranged in a speciﬁcally ordered pattern. Each of these rod-shaped mole-
cules has a strong electric dipole moment and can thus be oriented in an
electric ﬁeld, see Section 9.5. The viscous liquid is encapsulated in a glass
container and is initially treated so that the molecules on one end are aligned
at right angles to the ones on the other end; see Fig. 13.52(a). Moreover, the
orientations of the molecules vary gradually from, say, a vertical to a
horizontal array, as also depicted in Fig. 13.52(a). It is therefore called a
“twisted nematic” type LCD.
If light which is polarized parallel to the aligned molecules of one end
impinges on such a crystal, its electric vector will follow the twist of the
molecules through the liquid crystal to the other end and emerges therefore
on the opposite side with its polarization direction perpendicular to its
original orientation. Since the analyzer that is placed behind the liquid
crystal is oriented perpendicular to the polarizer, the emerging light beam
is transmitted.
Light source
or mirror
Light source
or mirror
(a)
(b)
Polarizer
Polarizer
Light
Analyzer
Analyzer
Liquid
crystal
ITO
+
–
ITO
Dark
1V
Figure 13.52. Schematic representation of a liquid crystal display unit (a) in the light-
transmitting mode, (b) in the non-light-transmitting mode, caused by a potential that is
applied to the end faces of the (twisted nematic) liquid crystal. Polarizer and analyzer are
identical devices that allow the light (i.e., the electric ﬁeld vector) to oscillate in only one
direction as indicated by arrows (see also Section 13.1.2). The end faces of the liquid
crystal–containing glass vessel are coated by transparent electrodes such as indium-tin-
oxide (ITO), see Section 9.3.
13. Applications
311



--- Page 325 ---

On the other hand, if a small voltage (about 1 volt) is applied to the con-
ducting end faces of the liquid crystal, the molecules (dipoles) align parallel
to the ﬁeld direction and the light is therefore not caused to change its
polarization direction, see Fig. 13.52 (b). Thus, since polarizer and analyzer
are mutually perpendicular to each other, the light is blocked from trans-
mission. (If the polarity of the voltage on the crystal is reversed, the response
of the LCD is not changed!)
In practice, a mirror is placed behind the liquid crystal arrangement
which reﬂects the ambient light back to the viewer if the LCD is in the
transmission mode. Alternatively, the display can be illuminated from the
back to allow dark readability.
The advantage of LCDs is that they are inexpensive and that they
consume very little energy (at least as long as no back-lighting is utilized).
Moreover, they are compact, lightweight, portable, energy efﬁcient, and
pose lesser problems when recycling, compared to CRTs. On the negative
side, LCDs cannot be read in the dark or in dim light without back-lighting.
Furthermore, they have a limited usable temperature range (20C to 47C),
slow time response, and most of all, they have a very narrow viewing angle.
LCDs are matrix addressed by applying voltages to rows and columns,
similarly as depicted in Fig. 8.45.
13.8.17. Emissive Flat-Panel Displays
Electroluminescent devices utilize a thin phosphor ﬁlm, such as manga-
nese-doped zinc sulﬁde (ZnS:Mn), which is sandwiched between two insu-
lating ﬁlms, e.g., Al2O3 or Al–Ti–O (ATO). These ﬁlms are surrounded by
two conducting ﬁlms (one of them being transparent indium-tin-oxide (ITO)
on glass and the other a good reﬂector), see Fig. 13.53. The light emission is
generally induced by an alternating (pulsed) electrical potential9 (about
120–200 V) applied between the two conducting electrodes. This generates
an electric ﬁeld amounting to about 106 V/cm across the phosphor layer,
which causes an injection of electrons into the phosphor. Once the threshold
voltage has been exceeded, the electrons become ballistic and excite the
electrons of the activator atom in the phosphor (e.g., Mn) into a higher
energy state. Upon reverting back into the ground state, photons of the
respective wavelength are generated. As an example, a broad orange-yellow
spectrum is emitted from the above-mentioned ZnS:Mn. Green color is
observed for ZnS:Tb and blue-green for SrS:Ce. Blue light is seen when
utilizing (Sr0.45Ca0.55)1x or Ga2S4:Cex, and red light is emitted from
9A dc voltage is possible but electromigration of impurity ions (e.g. halides) which causes
eventually a counter ﬁeld shortens the lifetime of the device.
312
III. Optical Properties of Materials



--- Page 326 ---

ZnS:Sm, Cl, or CaS:Eu. To produce white light, a combination of ZnS:Mn
and SrS:Ce has been used as phosphors. Green and red can also be obtained
by ﬁltering light from ZnS:Mn.
The cost of electroluminescent devices is higher than for LCDs, but the
viewing angle is wider and the usable temperature range is larger. They are
rugged and have long lifetimes. Even though the luminescence efﬁciency is
relatively good, readability in sunlight is still a problem. The response time
is fast enough for video displays, but the power and voltage requirements
(about 120–200 V) are difﬁcult to obtain for small portable device applica-
tions. Electroluminescent devices comprise at present about 4% of the ﬂat-
panel market. They ﬁnd applications in medical instruments, transportation,
defense, and industrial equipment.
Plasma display panels (PDPs) operate quite similar to ﬂuorescence light
bulbs (Fig. 13.31). A relatively high AC voltage (100 V) is applied across a
discharge gas (such as a helium/neon/xenon mixture) to create a plasma, see
Figure 13.54. Recombination of electron-ion pairs in the plasma causes
photons of high energy (that is, in the UV range). They are absorbed by
phosphors which in turn emit visible light. Individually addressable com-
partments, which may contain different phosphors, yield the pixels needed
for the three fundamental colors.
Flat-panel displays of this type are rugged, about 6 cm thick, provide deep
blacks for better contrast ratios, the viewing angles are wide (up to 178),
and the lifetimes (at which there is a 50% reduction in light output) are
estimated to be 100,000 hours. However, the pixel sizes are too large for
small displays, that is, screens sizes below 32 inches diagonally are not on
the market. On the other hand, large screen sizes up to 150 inches are quite
popular. Because of high refresh rates and fast response times, there is
Light
Glass
ITO
Insulator
Phosphor
Insulator
AI
Figure 13.53. Schematic diagram of an electroluminescent device operated by alternating
current pulses of about 200 V. The thin-ﬁlm layers are about 300 nm thick except in the case
of the phosphor, whose thickness is between 600 and 1,000 nm. The phosphor consists of the
host matrix, such as a wide-band gap metal sulﬁde (ZnS, CuS, SrS), and an “activator”, also
called “luminescence center”, such as Mn, Tb, Eu, Ce, Sm, Cu, Ag, etc.
13. Applications
313



--- Page 327 ---

essentially no blur for rapid motion which helps for displaying sports events
etc. PDPs are quite heavy because of two glass plates which hold the gases.
The power consumption is high, for example, 400 watts for a 50 inch screen
which is equivalent to cathode ray tubes. The colors tend to “wash out” in
strong ambient light and the front glass causes a glare if no anti-glare layer is
applied. Radio frequency interference by plasma displays may be disturbing
to short wave and AM radio listeners. Plasma displays currently (2010)
share about 8% of the TV ﬂat-panel display market.
Field-emission displays (FEDs) are still in the experimental stage. They
have much in common with cathode ray tubes (CRT), that is, with the bulky
displays previously used for TVs and desk computers. Essentially, they
consist of a matrix of tiny CRTs whereby each sub-CRT represents a single
pixel. Electrons are “boiled-off” by thermionic emission (heat) from a large
number of tip-shaped ﬁeld-emitters (made of Mo, Si, Pt, or carbon nanotube
cones), that can be matrix-addressed. They are encapsulated and hermeti-
cally sealed off in a thin cavity. A voltage between a grid, situated above the
emitters accelerates the electrons to the front plate and there, causes to light a
phosphor, covering the inside face of this plate by cathodoluminescence (see
Section 13.8.1). FEDs require a vacuum which is at present, difﬁcult to
sustain for a long time. The aim is to build ﬂat (about 1 cm thick) FEDs,
having wide viewing angles and fast response times. It is anticipated that
FEDs combine the high contrast level, and fast response time of CRTs with
small power consumption in the range of 10–15 W.
The SED (surface-conduction electron-emitter display) is a variation of
the FED and uses one emitter for each column instead of individual emitters.
Most of the ﬂat panel displays are of the volatile type, that is, the
pixels are periodically refreshed to retain their image. The refresh rate is
typically several times per second which may cause eye irritation. For the
Glass
Glass
Electrodes in
dielectric layer
Light
Gas-filled
plasma cells
phosphor-coated
Transparent
 electrodes in
dielectric layer
Protective MgO coating
Figure 13.54. Schematic representation of a plasma display (not drawn to scale).
314
III. Optical Properties of Materials



--- Page 328 ---

non-volatile or static displays, the image requires energy to change. This
mode is more energy efﬁcient.
It is estimated that TVs account for 10% of a home’s energy use. For
example, a 42-inch Hitachi plasma display draws 313 W of power (2007
value), whereas a same sized Sharp liquid crystal display is rated as 232 W
(2009). It is feared that the energy use will rise as consumers will buy
bigger, more elaborate TVs and watch them longer. The California Energy
Commission recently mandated therefore a reduction of TV power con-
sumption to <116 W by 2013.
13.9. Integrated Optoelectronics
Integrated optoelectronics deals with a family of optical components, such
as lasers, photodiodes, optical waveguides, optical modulators, optical stor-
age devices, etc., which are integrated on a common substrate (if feasible)
with the aim of fulﬁlling similar functions as electrical integrated circuits
do. The main difference to electrical devices is that in optical integrated
circuits (OICs) the signal is transmitted by light. Still, they need in most
cases electrical energy to become functional, which explains the name opto-
electronic. Among the advantages of optical devices are reduced weight, the
capability of light of different wavelengths to travel independently and
simultaneously in the same waveguide (multiplexing), the immunity against
receiving extraneous signals from surrounding devices by stray electromag-
netic coupling (crosstalk), the difﬁculty in performing wire taps (because of
the lack of electromagnetic ﬁelds, which would extend beyond the optical
ﬁber), high reliability, speeds greater than electrons in a metallic wire, larger
bandwidth (1012 Hz compared to 105 Hz for telephones) and notably, the
low-loss transmission (<2 dB/km) of signals in optical ﬁbers. Most of all,
however, telecommunication utilizing laser optics, allows the simultaneous
transmission of billions of telephone calls in one glass ﬁber, that is, as many
simultaneous telephone calls as there are humans on earth! The sales of
optoelectronic devices are presently in the neighborhood of 20–30 billion
dollars worldwide!
We have discussed in previous chapters two major optoelectronic compo-
nents, the laser (Section 13.8) and the photo detector (Sections 8.7.6 and
8.7.7). A few more building blocks need to be added to complete the picture.
This will be done now.
13.9.1. Passive Waveguides
The interconnecting medium between various optical devices is called a
waveguide. It generally consists of a thin, transparent layer whose index of
13. Applications
315



--- Page 329 ---

refraction, n2, is larger than the refractive indices of the two surrounding
media, n1 and n3. If this condition is fulﬁlled and if the light impinges on the
boundary between n2 and n1 (or n3) at an angle which is larger than the angle
of total reﬂection.10 then the optical beam travels in zigzag paths between the
internal boundaries of Region 2. In other words, by undergoing total reﬂec-
tion, the light wave is considered to remain in the center region. This statement
needs, however, some reﬁnement. As a rule, the light which travels in the
center medium extends, to a certain degree, into the neighboring media. The
spatial distribution ofthe optical energy withinall three media is called a mode.
This spatial distribution can be calculated by solving the wave equation (10.4)
while taking the appropriate boundary conditions into consideration. We have
done this twice in earlier parts of this book (Section 10.3 and Section 4.3). We
learned there that the electric ﬁeld strength or, equivalently, the intensity of
a wave, decreases in the adjacent medium obeying an exponential function.
If two boundaries need to be considered, as in the present case, and if the
thickness, t, of the center region is comparable to the wavelength of light,
then the solution of the wave equation yields an electric ﬁeld strength distribu-
tion (as depicted in Fig. 13.55, lower curve). Now, we know from previous
calculations (Section 4) that under certain conditions additional solutions, i.e.,
distribution functions, do exist (similarly, as a vibrating string can oscillate at
Figure 13.55. Electric ﬁeld strength distribution (modes) in a waveguide assuming n1 ¼ n3
(symmetric behavior). The zeroth order and higher-order modes are shown. (Compare with
Fig. 4.8).
10If light passes from an optically dense material (e.g., glass with n1 	 1.5) into air (n2 	 1), then
the angle of the refracted beam, b, is larger than the angle of incidence, a. At a critical angle, aT, b
becomes 90 (grazing exit). Total reﬂection occurs when sin aT > n2/n1; see also Section 10.2.
316
III. Optical Properties of Materials



--- Page 330 ---

higher harmonics). In the present case they are called ﬁrst-order, second-order,
etc., modes. They are likewise depicted in Fig. 13.55. The reader probably
recognizes that this “optical tunnel effect” is equivalent to the quantum
mechanical tunnel effect shown in Fig. 4.8.
We now consider the most common case, in which n1 is considerably
smaller than n3, e.g., n1 ¼ 1 for air and n3 ¼ 3.6 for GaAs (whereas n2 is
still made larger than n3!). For this asymmetric case the condition for
containing the light in the waveguide is
n2  n3
 2k þ 1
ð
Þ2l2
0
32n2t2
;
(13.20)
where l0 is the wavelength of the light in vacuum, k ¼ 0, 1, 2 . . . is the
mode number, and t is the thickness of the center layer. A calculation (see
Problem 1) shows that the difference between n2 and n3 needs to be only
about 1% in order to contain the light in the center medium.
13.9.2. Electro-Optical Waveguides (EOW)
So far we tacitly implied that the various layers of a waveguide structure
have been permanently manufactured by some type of deposition process
out of the gaseous or liquid phase on a semiconducting substrate. This is
indeed quite often done by employing, for example, molecular beam epitaxy
or liquid phase epitaxy processes. However, a rather ingenious alternative
method can be utilized instead. This technique involves a Schottky-barrier
contact which, when reverse biased, forms (as we know from Section 8.7.2)
a wide depletion layer (Fig. 13.56). We shall show in a short calculation that
a depletion of charge carriers increases the index of refraction of a solid.
Figure 13.56. Electro-optical waveguide making use of a reverse-biased Schottky-barrier
contact. (See also Fig. 8.15.) The light travels in Medium 2 (the depletion layer) when a high-
enough voltage is applied to the device.
13. Applications
317



--- Page 331 ---

Recall that n2 > n3 (and n1) is the prerequisite for a waveguide structure.
We derived in Chapter 11 a relationship between the free carrier density (Nf)
and the index of refraction,
^n2 ¼ 1 
e2Nf
4p2e0m*n2 ;
(11.7)
where m* is the effective mass of the electrons in the medium, v is the
frequency of light, e is the charge of the electrons, and ^n ¼ n  ik is the
complex index of refraction. We rewrite (11.7) twice for the substrate
(Medium 3) and for the depletion layer from which some free carriers
have been removed by the applied electric ﬁeld (Medium 2).
^n2
2 ¼ 1 
e2Nf2
4p2e0mn2 ;
(13.21)
^n2
3 ¼ 1 
e2Nf3
4p2e0mn2 :
(13.22)
The difference in the indices of refraction is then
^n2
2  ^n2
3 ¼
e2
4p2e0mn2 Nf3  Nf2
ð
Þ;
(13.23)
which reduces with11
^n2
2  ^n2
3 ¼ ^n2 þ ^n3
ð
Þ ^n2  ^n3
ð
Þ 	 2^n3 ^n2  ^n3
ð
Þ
and c ¼ n · l to
^n2  ^n3 ¼
e2l2
2n34p2e0mc2 Nf3  Nf2
ð
Þ:
(13.24)
In the present case (transparent media) we can assume that the damping
constant, k, in ^n ¼ n  ik is negligibly small, so that ^n in (13.24) becomes a
real quantity:
n2  n3 ¼
e2l2
2n34p2e0mc2 Nf3  Nf2
ð
Þ:
(13.25)
Equation (13.25) demonstrates, as suggested above, that a reduction in the
number of free carriers from Nf3 to Nf2 causes an increase in the index of
refraction in Medium 2. Then, the device becomes an optical waveguide.
For this to happen, the doping of the substrate needs to be reasonably high in
order that an appreciable change in the index of refraction is achieved (see
Problem 4).
11^n2 can be assumed to be approximately equal to ^n3 (see above and Problem 1) which yields
^n2 + ^n3 	 2^n3.
318
III. Optical Properties of Materials



--- Page 332 ---

13.9.3. Optical Modulators and Switches
When discussing electronic devices in Section 8.7.12, we encountered a
digital switch that is capable of turning the electric current on or off by
applying a voltage to the gate of a MOSFET. An equivalent optical device is
obtained by making use of the electro-optical waveguide (Fig. 13.56). In the
present case, this device is biased initially just below the threshold, i.e., at a
voltage which barely prevents the lowest-mode optical wave from passing.
Then, by an additional voltage between metal and substrate, the EOW
becomes transparent. In analogy to its electrical equivalent (Fig. 8.30),
this device may be called an enhancement-type or normally-off electro-
optical wave-guide. By varying the bias voltage periodically above the
threshold, the EOW can serve as an effective modulator of light.
A depletion-type or normally-on EOW can also be built. This device
exploits the Franz–Keldysh effect, i.e., the shift of the absorption edge to
lower energies when an electric ﬁeld is applied to a semiconductor
(Fig. 13.57). The photon energy of the light is chosen to be slightly smaller
than the band gap energy (dotted line in Fig. 13.57). Thus, the semiconduc-
tor is normally in the transparent mode. If, however, a large electric ﬁeld
(on the order of 105 V/cm) is applied to the device, then the band gap
shifts to lower energies and the absorbance at that particular wavelength
(photon energy) becomes several orders of magnitude larger, thus essen-
tially blocking the light. (The Franz–Keldysh shift can be understood
when inspecting Fig. 8.15, which shows a lowering of the conduction
band and thus a reduction in the band gap energy when a reverse bias is
applied to a semiconductor.)
Figure 13.57. Schematic representation of the Franz–Keldysh effect.
13. Applications
319



--- Page 333 ---

Finally, if a piezoelectric transducer imparts some pressure on a wave-
guide, the index of refraction changes. This photoelastic effect can also be
utilized for modulation and switching.
Electro-optical modulators can be switched rapidly. The range of fre-
quencies over which the devices can operate is quite wide.
13.9.4. Coupling and Device Integration
We now need to discuss some procedures for transferring optical waves (i.e.,
information) from one optical (or optoelectronic) device to the next. Of
course, butting, i.e., the end-on attachment of two devices, is always an
option, particularly if their cross-sectional areas are comparable in size. This
technique is indeed frequently utilized for connecting optical ﬁbers (used in
long-distance transmission) to other components. A special ﬂuid or layer
which matches the indices of refraction is inserted between the two faces in
order to reduce reﬂection losses. Optical alignment and permanent mechan-
ical attachment are nontrivial tasks. They can be mastered, however. In those
cases where no end faces are exposed for butting, a prism coupler may be
used. This device transfers the light through a longitudinal surface. In order
to achieve low-loss coupling, the index of refraction of the prism must be
larger than that of the underlying materials. This is quite possible for glass
ﬁbers (n 	 1.5) in conjunction with prisms made out of strontium titanate
(n ¼ 2.3) or rutile (n ¼ 2.5), but is difﬁcult for semiconductors (n 	 3.6).
Phase coherent energy transfer between two parallel waveguides (or
an optical ﬁber and a waveguide) can be achieved by optical tunneling
(Fig. 13.58). For this to occur, the indices of refraction of the two wave-
guides must be larger than those of the adjacent substrates. Further, the
width of the layer between the two waveguides must be small enough to
allow the tails of the energy proﬁles to overlap.
Figure 13.58. Schematic representation of energy transfer between two waveguides (or a
waveguide and an optical ﬁber) by optical tunneling. Compare with Fig. 13.55. (n2 > n1, n3).
320
III. Optical Properties of Materials



--- Page 334 ---

The most elegant solution for efﬁcient energy transfer is the monolithic
integration of optical components on one chip. For example, a laser and a
waveguide may be arranged in one building block, as schematically
depicted in Fig. 13.59. Several points need to be observed however. First,
the wavelength of the light emitted by the laser needs to be matched to a
wavelength at which the absorption in the waveguide is minimal. Second,
the end faces of the laser need to be properly coated (e.g., with SiO2) to
provide adequate feedback for stimulated emission.
Another useful integrated structure involves a transverse photodiode that
is coupled to a waveguide, see Fig. 13.60. As explained in Section 8.7.6, this
Figure 13.59. Schematic representation of a monolithic laser/waveguide structure. Compare
with Fig. 13.43.
Figure 13.60. Schematic representation of a monolithic transverse photodiode/waveguide
structure. A wide depletion layer (active region) is formed in the n-region by the reverse bias.
For details, see Section 8.7.6.
13. Applications
321



--- Page 335 ---

photodiode is reverse biased. The electron–hole pairs are created in or near a
long and wide depletion layer by photon absorption. The losses are mini-
mized owing to the fact that the light does not have to penetrate the
(inactive) p-region as in ﬂat-plate photovoltaics. The quantum efﬁciency
of the transverse photodiode can be considerably enhanced by increasing the
length of the depletion layer.
All taken, the apparently difﬁcult task of connecting optical ﬁbers, wave-
guides, lasers, or photodetectors and their integration on one chip have
progressed considerably in the last decade and have found wide application
in a multitude of commercial devices.
13.9.5. Energy Losses
Optical devices lose energy through absorption, radiation, or light scatter-
ing, similarly as the electrical resistance causes energy losses in wires, etc.
The optical loss is expressed by the attenuation (or absorbance), a, which
was deﬁned in Section 10.4. It is measured in cm1 or, when multiplied by
4.3, in decibels per centimeter.
Scattering losses take place when the direction of the light is changed by
multiple reﬂections on the “rough” surfaces in waveguides or glass ﬁbers, or
to a lesser extent by impurity elements and lattice defects.
Absorption losses occur when photons excite electrons from the valence
band into the conduction band (interband transitions), as discussed in
Chapter 12. They can be avoided by using light whose photon energy is
smaller than the band gap energy. Free carrier absorption losses take place
when electrons in the conduction band (or in shallow donor states) are raised
to higher energies by intraband transitions. These losses are therefore
restricted to semiconductor waveguides, etc., and essentially do not occur
in dielectric materials. We know from (10.22) that the absorbance, a, is
related to the imaginary part of the dielectric constant, e2, through
a ¼ 2p
ln e2:
(13.26)
On the other hand, the free electron theory provides us with an expression
for e2 (11.27), which is, for n2
 n2
2,
e2 ¼ n2n2
1
n3 ;
(13.27)
where
n2
1 ¼
e2Nf
4p2e0m
(13.28)
322
III. Optical Properties of Materials



--- Page 336 ---

(see (11.8)) and
n2 ¼ 2pe0n2
1
s0
(13.29)
(see (11.23)) and
s0 ¼ Nfem
(13.30)
(see (8.13)). Combining equations (13.26) through (13.30) yields
a ¼
e3Nfl2
4p2e0n m
ð
Þ2c3m
:
(13.31)
We note in (13.31) that the free carrier absorbance is a linear function of Nf
and is inversely proportional to the mobility of the carriers. The absorbance
is also a function of the square of the wavelength.
Radiation losses are, in essence, only signiﬁcant for curved-channel
waveguides, in which case photons are emitted into the surrounding
media. A detailed calculation reveals that the radiation loss depends expo-
nentially on the radius of the curvature. The minimal tolerable radius differs
considerably in different materials and ranges between a few micrometers to
a few centimeters. The energy loss is particularly large when the difference
in the indices of refraction between the waveguide and the surrounding
medium is small.
13.9.6. Photonics
A short note on the recently coined term “photonics” shall be added.
Electronics deals with electrons and materials in which electrons propagate.
Similarly photonics relates to photons and their interaction with photonic
crystals. These crystals are materials that possess a periodicity of the
dielectric constant so that they can affect the properties of photons in
much the same way as electrons are affected by periodically arranged
atoms, that is, by the lattice structure. However, photonic crystals need to
be created artiﬁcially. The “lattice constant” of photonic crystals must be
comparable to the wavelength of light, that is, the periodicity needs to be on
the order of 500 nm. This requires high-resolution microlithography tech-
niques, as known from semiconductor processing, involving X-rays or
electron beams.
The solution of the Maxwell equations for this particular case (rather than
the Schr€odinger equation) leads to photonic band structures, Brillouin
zones, and occasionally to band gaps quite similarly as known from elec-
tronics. Rather than displaying s- or p-bands, photonic band structures
contain transverse magnetic (TM) or transverse electric (TE) modes. Doping
13. Applications
323



--- Page 337 ---

can be accomplished by introducing point defects that affect the periodicity
of the photonic crystal. This leads to localized photonic states within the gap
similar to donor or acceptor states. Furthermore, a line defect acts like a
waveguide and a planar defect behaves like a mirror. Photonic band struc-
tures are quite similar to phononic band structures (see Chapter 20.2) and,
naturally, to electronic bands.
The research results of this ﬁeld should be followed with considerable
anticipation.
13.9.7. Optical Fibers
We have discussed in Sections 13.7, 13.8.10, 13.8.11, and 13.9 some
fundamentals for the understanding of optical ﬁbers. In the present section
we summarize the information given before and supplement it with further
details, in particular pertaining to materials for telecommunication. The
crucial goal in telecommunications is to achieve a low attenuation of the
transmitted signal. One of the methods to obtain this is by doping a silica
ﬁber with germanium dioxide. This yields an energy loss of the light by
only about 2 dB/km, which is considerable less than for copper cables. As a
consequence, repeaters (ampliﬁers) can be distanced as far as 70–150 km
(43–93 miles) from each other. Moreover, the erbium-doped ﬁber ampliﬁer
(Section 13.8.11) which utilizes a travelling-wave laser, involving stimu-
lated emission, improves this distance by eliminating the transfers between a
weak optical signal, to an electrical signal, and again to an enhanced optical
signal. Optical ﬁbers are not susceptible to electrical interference, wire
tapping, cross talk between signals, laser-induced optical damage, and
pick-up of environmental noise. Glass ﬁbers are light in weight, and do
not require much space. Fibers made of silica (doped or undoped) are
therefore mainly used for long-distance, terrestrial transmissions of signals.
On the other hand, ﬁbers made of photonic-crystals (see Section 13.9.6) in
which the light is guided by means of diffraction through a “lattice”,
entailing a periodic dielectric constant, have also been developed. They
can carry a higher power than the ﬁbers just discussed.
As shown in Fig. 13.30 commercial optical ﬁbers have a minimum in
energy loss around 1.31 and 1.55 mm. These IR “windows” are mainly used
for communication purposes.
As already mentioned previously, each individual optical ﬁber is able to
carry a large number of “channels” using different wavelengths, each of
which can be modulated typically with about 40 Gb/s of information (multi-
plexing). This allows billions of simultaneous telephone calls.
An optical ﬁber consists of highly puriﬁed silica (doped or undoped), or
a phosphosilicate core (about 8 to10 mm in diameter) which is surrounded by
a borosilicate cladding of 125 mm in diameter, whereby the index of
refraction of the core (nco ¼ 1.48) is slightly larger than that of the cladding
324
III. Optical Properties of Materials



--- Page 338 ---

(ncl ¼ 1.46). Because of this difference, the propagation of light within the
core occurs under certain circumstances by internal (total) reﬂection. There
exists a critical angle, aT, above which total reﬂection takes place, (see
Footnote 10 in Section 13.9.1). Thus, the light has to impinge under a
minimum angle, aT, onto the face of the core, called acceptance cone.
The critical angle is determined by the ratio of the refractive indices
between core and cladding (Footnote 10).
Irregular (rough) surfaces cause scattering of light and thus, some loss of
light energy. The cladding is coated on the outside with a ~250 mm, tough,
resin buffer which adds strength to the ﬁber. Finally a ~400 mm thick jacket
serves as protection against mechanical abuse. Fibers are connected
(spliced) to each other by arc-melting to fuse the ends together, or by special
connectors. Both techniques yield some loss in energy (about 0.1 dB) and
are by no means trivial tasks, compared to connecting two wires.
It should be added in closing that optical ﬁbers are also used for medical
applications (gastroscopes, endoscopes, minimally invasive surgery), for
remote sensors, and for illumination purposes.
13.10. Optical Storage Devices
Optical techniques have been used for thousands of years to retrieve stored
information. Examples are ancient papyrus scrolls or stone carvings. The
book you are presently reading likewise belongs in this category. It is of
the random-access type, because a particular page can be viewed immedi-
ately without ﬁrst exposing all previous pages. Other examples of optical
storage devices are the conventional photographic movie ﬁlm (with or
without optical sound track) or the microﬁlm used in libraries. The latter
are sequential storage media because all previous material has to be
scanned before the information of interest can be accessed. They are also
called read-only memories (ROM) because the information content cannot
be changed by the user. All examples given so far are analog storage
devices.
Another form of storage utilizes the optical disk, which has gained wide-
spread popularity. (Speciﬁcally, 200 billion CDs (compact disks) have been
sold worldwide in 2007, even though MP3 and other ﬂash memories have
cut into the CD market.) Here, the information is stored in digital form. The
most common application, the just mentioned compact disk is a random-
access, read-only memory (ROM) device. However, “write-once, read-
many” (WORM) and erasable magneto-optical disks (Section 17.5) are
also available. Further, rewritable CD-RW disks are on the market, see
below. The main advantage of optical techniques is that the readout involves
a noncontact process (in contrast to magnetic tape or mechanical systems).
Thus, no wear is encountered. Moreover, all optical storage devices are of
13. Applications
325



--- Page 339 ---

the non-volatile type, that is, the information is retained without maintaining
a voltage.
Let us now discuss the optical compact disk. Here, the information is
stored below a transparent, polymeric medium in the form of bumps, as
shown in Fig. 13.61. The height of these bumps is one-quarter of a wave-
length (l/4) of the probing light. Thus, the light which is reﬂected from the
base of these bumps (called the “land”) travels half a wavelength farther
than the light reﬂected from the bumps. If a bump is encountered, the
combined light reﬂected from bump and land is extinguished by destructive
interference. No light may be interpreted as a zero in binary code, whereas
full intensity of the reﬂected beam would then constitute a one. (Actually,
the bumps and lands themselves do not immediately represent the zeros and
ones. Instead, a change from bump to land or land to bump indicates a one,
whereas no change constitutes a zero.) Eight ones and zeros represent one
byte of data, see Section 8.7.12. For audio purposes, the initial analog signal
is sampled at a frequency of 44.1 kHz (about twice the audible frequency) to
digitize the information into a series of ones and zeros (similarly as known
for computers). Quantization of the signal into 16-digit binary numbers
gives a scale of 216 or 65,536 different values. This information is trans-
ferred to a disk (see below) in the form of bumps and absences of bumps. For
readout from the disk, the probing light is pulsed with the same frequency so
that it is synchronized with the digitized storage content.
The spiral path on the useful area of a 120 mm diameter CD is 5.7 km
long and contains 22,188 tracks spaced 1.6 mm apart. (As a comparison,
30 tracks can be accommodated on a human hair.) The spot diameter of the
Lens
0.7
mm
1.2 mm
Transparent
polymer
Air
Incident beam
Incident
beam
Motion
1.6μm
0.5μm
Base of reflecting
surface
Laquer
Label
00 111 00 110 111 010 111 0
4
λ
(a)
(b)
Figure 13.61. Schematic of a compact disk optical storage device. Readout mode. (Not
drawn to scale.) The reﬂected beams in Fig. 13.61(b) are drawn under an angle for clarity.
The land and bump areas covered by the probing light have to be of equal size in order that
destructive interference can occur (see the hatched areas covered by the incident beam in
Fig. 13.61(b)).
326
III. Optical Properties of Materials



--- Page 340 ---

readout beam near the bumps is about 1.2 mm. The information density on a
CD is 800 kbits/mm2, i.e., a standard CD can hold about 7  109 bits. This
number increases by a factor of ten when blue emitting lasers (l ¼ 405 nm,
blue-ray format, see below) are used. The current playback time is about 80
minutes.12 A disk of the same diameter can also be digitally encoded with
700 megabyte of computer data, which is equivalent to three times the text
of a standard 24-volume encyclopedia.
The manufacturing process of CDs requires an optically ﬂat glass plate
which has been covered with a light-sensitive layer (photoresist) about l/4
in thickness. Then, a helium–neon laser whose intensity is modulated
(pulsed) by the digitized information is directed onto this surface while
the disk is rotated. Developing of the photoresist causes a hardening of the
unexposed areas. Subsequent etching removes the exposed areas and thus
creates pits in the photoresist. The pitted surface is then coated with silver
(to facilitate electrical conduction) and then electroplated with nickel. The
nickel mold thus created (or a copy of it) is used to transfer the pit structure
to a transparent polymeric material by injection molding. The disk is
subsequently coated with a reﬂective aluminum ﬁlm and ﬁnally covered
by a protective lacquer and a label.
The CD is read from the back side, i.e., the information is now contained
in the form of bumps (see Fig. 13.61). In order to facilitate focusing onto a
narrow spot, monochromatic light, as provided by a laser, is essential. At
present, a GaAlAs heterojunction laser having a wavelength in air of 780 nm
is utilized. The beam size at the surface of the disk is relatively large (0.7
mm in diameter) to minimize possible light obstruction by small dust
particles. However, the beam converges as it traverses through the polymer
disk to reach the reﬂecting surface that contains the information. Small
scratches or ﬁngerprints on the polymer surface are also tolerated quite
well, but large scratches and blemishes make the CD useless. The aligning
of the laser beam on the extremely narrow tracks is a nontrivial task, but it
can be managed. It involves, actually, three light beams, obtained by
dividing the impinging laser beam shown in Fig. 13.55(b) into three parts,
utilizing a grating or a holographic element. One of these parts (the center
one) is the above-described read beam. The other two are tracking beams
which strike the inner and outer edges of the groove. The reﬂected signals
from the tracking beams are subtracted from each other. A null signal
indicates correct tracking while positive or negative signals cause the
servo to move the read head to one or the other side. The tracking is accurate
to about 0.1 mm.
12The playback time of 80 minutes and the resulting disk diameter of 120 mm is said to have been
contrived so that Beethoven’s 9th symphony, played by Furtw€angler at the Bayreuth festival could
be accommodated on one disk. In reality, a competitive battle between Phillips and Sony played a
major role in this decision and the Beethoven 9th symphony was just used as a pretext.
13. Applications
327



--- Page 341 ---

The recordable compact disk (CD-R) contains a blank data spiral.
During manufacturing, a photosensitive dye is applied before the metalliza-
tion is laid down. The write laser of the CD recorder changes the color of the
dye and thus, encodes the track with the digital data. This type of storage
may undergo some degradation. Indeed, after a lifetime of 20 to 100 years
(in some cases only 18 months, depending on the quality of the CD) the dye
degrades, which is called “CD rot”. A CD-R can be encoded only once.
The rewritable compact disk (CD-RW) utilizes the amorphous to
crystalline transformation technique which we have discussed in detail at
the end of Section 8.7.12. In short, a transformation between the two phases
of chalcogenide glasses is caused by a writing laser beam which emits short
(ns) pulses to the track. Some crystalline and amorphous chalcogenides
have pronounced different indices of refraction and thus, differ in their
reﬂectivity which can be utilized to distinguish between the ones and
zeros. The estimated lifetime is considerably higher than for CD-Rs, (i.e.
nominal 300 years).
The DVD-ROM (digital versatile disk or digital video disk-read only
memory) and the DVD-RW (rewritable) work on the same phase transfor-
mation principal as just discussed. DVDs utilize a laser diode whose emis-
sion wavelength is shorter than for a CD, namely 650 nm. This allows a
smaller width between bumps of 0.74 mm (compared to 1.6 mm for CDs,
see Fig. 13.61) and thus, adds more storage capacity. A writing speed of 1x
stores 1.35 MB/s. Recent models use writing speeds 18 or 20 times as
fast. However, dual layer disks run at lower recording speeds. DVD-R and
DVD + R have slightly different storage abilities, speciﬁcally 4.707 and
4.700 GB respectively in their single layer versions (and almost twice as
much in their double layer rendition). Rewritable DVDs have a storage
capacity of about 4.7 GB (single-sided, single layer), 8.5 GB (for single-
sided double layer), and 9.4 GB (double sided, single layer) in contrast to the
CD which stores up to 700 MB. Dual-layer disks employ a second ﬁlm
underneath the ﬁrst one which is accessed by transmitting the laser light
through the ﬁrst, transparent layer.
The blu-ray Disc (BD; ofﬁcial spelling and abbreviation for trade-
mark reasons) utilizes 405 nm light beam from a GaN laser and thus, allows
focusing the beam to even smaller spots. As a consequence, almost 10 times
more data can be encrypted than for a DVD. Speciﬁcally, a BD can store 25
GB on a single layer, 12 cm disk and 50 GB using double layer technology.
Moreover, four-layer (100 GB) and even 16 data layers yielding 400 GB have
been demonstrated with the goal to reach eventually a 1 TB BD! Its main
application is for high-deﬁnition videos and for video games. Since the data
layer in BDs is much closer to the surface than for DVDs, which makes the
disks more vulnerable to scratches, several hard coating polymers have been
developed and applied by different companies. The driving speed at 36 Mbit/
s requires a writing time of 90 minutes on a single layer disk. This writing
time can be reduced to only 9 minutes when the driving speed is increased by
328
III. Optical Properties of Materials



--- Page 342 ---

a factor of 10. BD technology is, as of this writing, still in its development
phase and there is no indication that it will substantially replace standard
DVDs anytime soon mostly because of price and the fact that most users
are satisﬁed with the present DVD technology. Still, sales of software on
BD amounted to 177 million pieces in 2009. A nuisance is industry’s
implementation of regional codes for BD (as well as for DVD) players in
order to allow playing disks only in certain geographical areas of the world.
(Third-party shops make alterations to players to overcome this problem.)
Blu-ray Disc recordable (BD-R) can be written once, whereas BD-RE can
be erased and re-recorded several times.
A future technology is called holographic versatile disk which is pre-
dicted to hold eventually 3.9 TB of information.
The durability of the stored information on DVDs and similar disks is
determined, among others, by the sealing method, the storage practice, and
where it was manufactured. The predictions vary, as already outlined above.
Some manufacturers forecast lifetimes between 2 and 15 years, whereas
others claim lifetimes from 30 to 100 years and even longer. This compares
to the lifetimes of ancient papyrus scrolls which still can be read after more
than 2000 years.
An alternative to the above-described devices is the magneto-optical
device, which employs a laser to read the data on the disk while the
information is written by simultaneously exposing a small area on the disk
to a strong laser pulse in addition to a magnetic ﬁeld. This device will be
further described in Section 17.5. As of this writing, 4.6 GB can be stored on
a 51
4 inch (130 mm) magneto-optical disk. The data can be erased and
rewritten many times.
13.11. The Optical Computer
We have learned in Section 8.7 that transistors are used as switching
devices. We know that a small voltage applied to the base terminal of a
transistor triggers a large electron ﬂow from emitter to collector. The
question arises whether or not a purely optical switching device can be
built for which a light beam, having a small intensity, is capable of trigger-
ing the emission of a light beam that has a large intensity. Such an optical
transistor (called transphasor) has indeed been constructed which may
switch as much as 1000 times faster (picoseconds) than an electronic switch
(based on a transistor).
The main element of a transphasor is a small (a few millimeters long)
piece of nonlinear optical material (see below) which has, similar to a laser
(or a Fabry– Perot interferometer), two exactly parallel surfaces at its
longitudinal ends. These surfaces are coated with a suitable thin ﬁlm in
order to render them semitransparent. Once monochromatic light, stemming
13. Applications
329



--- Page 343 ---

from a laser, has entered this “cavity” through one of its semitransparent
windows, some of the light is reﬂected back and forth between the interior
windows, whereas another part of the light eventually escapes through the
windows (Fig. 13.62). If the length between the two windows just happens
to be an integer multiple of half a wavelength of the light, then constructive
interference occurs and the amplitude (or the intensity) of the light in the
“cavity” increases rapidly (Fig. 13.62(a)). As a consequence, the intensity of
the transmitted light is also strong. In contrast to this, if the distance between
Figure 13.62. Schematic representation of some light waves in a transphasor. The reﬂec-
tivity of the windows is about 90%. (a) Constructive interference. The length of the “cavity”
equals an integer multiple of l/2. (b) Condition (a) above is not fulﬁlled. The sum of many
forward and reﬂected beams decreases the total intensity of the light. (Note: No phase shift
occurs on the boundaries inside the “cavity”, because ncavity > nair).
330
III. Optical Properties of Materials



--- Page 344 ---

the two windows is not an integer multiple of half a wavelength of the light,
the many forward and reﬂected beams in the “cavity” weaken each other
mutually, with the result that the intensity of the transmitted light is rather
small (Fig. 13.62(b)). In other words, all conditions which do not lead to
constructive (or near constructive) interference produce rather small trans-
mitted intensities (particularly if the reﬂectivity of the windows is made
large).
The key ingredient of a transphasor is a speciﬁc substance, namely,
the above-mentioned nonlinear optical material which changes its index
of refraction as a function of the intensity of light. As we know from
Section 10.2 the index of refraction is
nmed ¼ cvac
cmed
¼ lvac
lmed
:
(13.32)
Thus, we have at our disposal a material which, as a result of high light
intensity, changes its index of refraction, which, in turn, changes lmed until
an integer multiple of lmed/2 equals the cavity length and constructive
interference may take place. Moreover, just shortly before this condition
has been reached, a positive feedback mechanism mutually reinforces the
parameters involved and brings the beams rapidly closer to the constructive
interference state.
An optical switch involves a “constant laser beam” whose intensity is not
yet strong enough to trigger constructive interference (Fig. 13.62(a)). This
light intensity is supplemented by a second laser beam, the “probe beam,”
which is directed onto the same spot of the window of the transphasor and
which provides the extra light energy to trigger a large change in n and thus
constructive interference (Fig. 13.63). All taken, a small intensity change
caused by the probe beam invokes a large intensity of the transmitted beam.
This combination of two signals that interact with a switching device can be
Figure 13.63. Schematic representation of an optical AND gate as obtained from an optical
transistor (transphasor) constructed from a material with nonlinear refractive index. The low
transmission state may represent a “zero” in binary logic, whereas the high transmission of
light may stand for a “one.”
13. Applications
331



--- Page 345 ---

utilized as an “AND” logic circuit, as described in Section 8.7.12. Likewise,
“OR” gates (either of the two beams is already strong enough to trigger
critically a change in n) or “NOT” gates (which involve the reﬂected light)
can be constructed.
One important question still remains to be answered. It pertains to the
mechanisms involved in a nonlinear optical material. Such a material
consists, for example, of indium antimonide, a narrow–band gap semicon-
ductor having a gap energy of only 0.2 eV. (It therefore needs to be cooled to
77 K in order to suppress thermally-induced conduction band electrons.)
Now, we know from Chapter 12 that when photons of sufﬁciently high
energy interact with the valence electrons of semiconductors, some of these
electrons are excited across the gap into the conduction band. The number
of excited electrons is, of course, larger the smaller the gap energy (see
Chapter 12) and the larger the number of impinging photons. On the other
hand, the index of refraction, n, depends on the number of free electrons, Nf
(in the conduction band, for example), as we know from (11.7),
^n2 ¼ 1 
e2Nf
4p2e0mn2 :
(13.33)
Thus, a high light intensity substantially changes Nf and therefore n as stated
above.
A crude photonic computer was introduced in 1990 by Bell Laboratories.
However, new nonlinear materials need to be found before optical compu-
ters become competitive with their electronic counterparts.
13.12. X-Ray Emission
Electromagnetic radiation of energy higher than that characteristic for UV
light is called X-rays. (Still higher-energy radiation are g-rays). X-rays were
discovered in 1895 by Wilhelm Conrad R€ontgen, a German scientist. In
1901, he received the ﬁrst Nobel Prize in physics for this discovery. The
wavelength of X-rays is in the order of 1010 m; see Figure 10.1. For its
production, a beam of electrons emitted from a hot ﬁlament is accelerated in
a high electric ﬁeld towards a metallic (or other) electrode. On impact, the
energy of the electrons is lost either by white X-radiation, that is, in the form
of a continuous spectrum (within limits), or by essentially monochromatic
X-rays (called characteristic X-rays) that are speciﬁc for the target material.
The white X-rays are emitted as a consequence of the deceleration of the
electrons in the electric ﬁeld of a series of atoms, where each interaction with
an atom may lead to photons of different energies. The maximal energy that
can be emitted this way (assuming only one interaction with an atom) is
proportional to the acceleration voltage, V, and the charge of the electron,
e, that is
332
III. Optical Properties of Materials



--- Page 346 ---

Emax ¼ eV ¼ hn ¼ hc
l
(13.34)
[see Eqs. (2.1) and (1.5)]. From this equation the minimum wavelength, l
(in nm), can be calculated using the values of the constants as listed in
Appendix 4 and inserting V in volts, that is
l ¼ 1240
V
:
(13.35)
Figure 13.64 depicts the voltage dependence of several white X-ray spectra.
The cutoff wavelengths, as calculated by Eq. (13.35), are clearly detected.
White X-radiation is mostly used for medical and industrial applications
such as dentistry, bone fracture detection, chest X-rays, and so on. Different
densities of the materials under investigation yield variations in the black-
ening of the exposed photographic ﬁlm which has been placed behind the
specimen.
The wavelength of characteristic X-rays depends on the material on
which the accelerated electrons impinge. Let us assume that the impinging
electrons possess a high enough energy to excite inner electrons, for exam-
ple, electrons from the K-shell, to leave the atom. As a consequence, an L
electron may immediately revert into the thus created vacancy while emit-
ting a photon having a narrow and characteristic wavelength. This mecha-
nism is said to produce Ka X-rays; see Figure 13.65. Alternately and/or
simultaneously, an electron from the M shell may revert to the K shell. This
is termed Kb-radiation.
For the case of copper, the respective wavelengths are 0.1542 nm and
0.1392 nm. (As a second example, aluminum yields Ka and Kb radiations
having characteristic wavelengths of 0.8337 nm and 0.7981 nm.) Character-
istic (monochromatic) X-radiation is frequently used in materials science, for
example, for investigating the crystal structure of materials. For this, only
Figure 13.64. Schematic representation of the wavelength dependence of the intensity of
white X-ray emission for selected acceleration voltages.
13. Applications
333



--- Page 347 ---

one of the possible wavelengths is used by eliminating the others utilizing
appropriate ﬁlters, made, for example, of nickel foils, which strongly absorb
the Kb-radiation of copper while the stronger Ka-radiation is only weakly
absorbed. The characteristic X-radiation is superimposed on the often
weaker, white X-ray spectrum.
Problems
1. Calculate the difference in the refractive indices which is necessary in order that an
asymmetric waveguide operates in the zeroth mode. Take l0 ¼ 840 nm, t ¼ 800 nm, and
n2 ¼ 3.61.
2. How thick is the depletion layer for an electro-optical waveguide when the index of
refraction (n3 ¼ 3.6) increases in Medium 2 by 0.1%? Take n1 ¼ 1, l0 ¼ 1.3 mm, and
zeroth-order mode.
3. Calculate the angle of total reﬂection in (a) a GaAs waveguide (n ¼ 3.6), and (b) a glass
waveguide (n ¼ 1.5) against air.
4. Of which order of magnitude does the doping of an electro-optical waveguide need to be
in order that the index of refraction changes by one-tenth of one percent? Take n3 ¼ 3.6,
m* ¼ 0.067 m0, and l ¼ 1.3 mm.
5. Calculate the free carrier absorption loss in a semiconductor assuming n ¼ 3.4,
m* ¼ 0.08 m0, l ¼ 1.15 mm, Nf ¼ 1018 cm3, and m ¼ 2  103 cm2/Vs.
6. Show that the energy loss in an optical device, expressed in decibels per centimeter,
indeed equals 4.3a.
Figure 13.65. Schematic representation of the emission of characteristic X-radiation by
exciting a K-electron and reﬁlling the vacancy thus created with an L-electron.
334
III. Optical Properties of Materials



--- Page 348 ---

7. Calculate the necessary step height of a “bump” on a compact disk in order that
destructive interference can occur. (Laser wavelength in air, 780 nm; index of refraction
of transparent polymeric materials, 1.55.)
8. Calculate the gap energy and the emitting wavelength of a GaAs laser that is operated at
100C. Take the necessary data from the tables in Appendix 4 and Table 19.2.
9. Why are LEDs in northern regions not useful for trafﬁc lights compared to incandescent
light bulbs?
Suggestions for Further Reading (Part III)
F. Abele`s, ed., Optical properties and electronic structure of metals and alloys, Proceedings
of the International Conference, Paris, 13–16 Sept. 1965, North-Holland, Amsterdam
(1966).
F. Abele`s, ed., Optical Properties of Solids, North-Holland, Amsterdam (1972).
M. Born and E. Wolf, Principles of Optics, 3rd ed., Pergamon Press, Oxford (1965).
G. Bouwhuis, ed., Principles of Optical Disc Systems, Adam Hilger, Bristol (1985).
M. Cardona, Modulation Spectroscopy Solid State Physics, Suppl. 11, Academic Press,
New York, (1969).
W.W. Duley, Laser Processing and Analysis of Materials. Plenum Press, New York (1983).
K.J. Ebeling. Integrierte Optoelektronik Springer-Verlag, Berlin (1989).
G. Fasol, S. Nakamura, I. Davies, The Blue Laser Diode: GaN-Based Light emitters,
Springer, New York (1997).
S.R. Forrest, The path to ubiquitous and low-cost organic electronic appliances on plastic,
Nature, 428, 911-918, (2004).
J.M.J. Fre´chet, and B.C. Thompson, Polymer-Fullerene Composite Solar Cells, in:
“Angewandte Chemie, Int. Ed.” 47, 58-77, (2008), Wiley-VCH Verlag GmbH & Co.,
KGaA, Weinheim.
M.P. Givens, Optical properties of metals, in Solid State Physics, Vol. 6, Academic Press,
New York (1958).
O.S. Heavens, Optical Properties of Thin Solid Films, Academic Press, New York (1955).
L.L. Hench and J.K. West, Principles of Electronic Ceramics, Wiley, New York (1990).
P.H. Holloway, S. Jones, P. Rack, J. Sebastian, T. Trottier, Flat Panel Displays: How Bright
and Colorful is the Future? Proceedings ISAF’96 Vol I IEEE page 127 (1996).
R.E. Hummel, Optische Eigenschaften von Metallen und Legierungen. Springer-Verlag,
Berlin (1971).
R.G. Hunsperger, Integrated Optics, Theory and Technology, 3rd ed., Springer-Verlag,
New York (1991).
T.S. Moss, Optical Properties of Semiconductors, Butterworth, London (1959).
P.O. Nilsson, Optical properties of metals and alloys, Solid State Physics, Vol. 29, Academic
Press, New York (1974).
F.A. Ponce and D.P. Bour, Nitrogen-Based Semiconductors for Blue and Green light-
emitting devices, Nature, 386, 351 (1997).
B.O. Seraphin, ed., Optical Properties of Solids—New Developments, North-Holland/
American Elsevier, Amsterdam, New York (1976).
J.H. Simmons and K.S. Potter, Optical Materials, Academic Press, San Diego (2000).
F. So, and J. Shi, Organic Molecular Light Emitting Materials and Devices, in: “Introduction
to Organic and Optoelectronic Materials and Devices”, CRC Textbook (2007).
A.V. Sokolov, Optical Properties of Metals, American Elsevier, New York (1967).
O. Svelto, Principles of Lasers, 2nd ed., Plenum Press, New York (1982).
A. Vasˇı´cˇek, Optics of Thin Films, North-Holland, Amsterdam (1960).
F. Wooten, Optical Properties of Solids, Academic Press, New York (1972).
13. Applications
335

