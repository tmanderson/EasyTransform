Easy Transform
=
Making transforms easier to work with since 2011
-

Easy Transform enhances the fun that is CSS3 transforms.

CSS transforms are easy:

    el.style.transform = 'rotate(20deg) translate(20px, 100px) scale(1.2)';

But let's face it, after that point, it's pretty tedious to manipulate an already added transform, this is where Easy Transform comes in. To do the above example with easy transform, all we gotta do is:

    ezt(el).rotate(20).translate(20, 100).scale(1.2);

Better yet, I can add right on to this transform without having to parse any silly transform strings. So, if I want to later rotate this element to 45 degrees all I gotta do is:

    ezt(el).rotate(25);

Don't want to add on to the rotation*? That's fine:

    ezt(el).reset().rotate(25);

**currently reset will reset the whole transform, this will not be the case in the future. I'm sure I'll add it soon.*

I'd say that my personal favorite is being able to get transform data **LIVE**. That means you can be running a CSS transition/animation that is rotating an el, and during that transition the following:

    ezt(el).getRotation();

will give back the current rotation of the element, not the ending position. Oh yeah, it gives it back to you as a simple int which is the rotation in degrees.

Every transform has a getter:

    ezt(el).getTranslation();
    ezt(el).getSkew();
    ezt(el).getScale();
    ezt(el).getTransform();

    //This will return the end transform (if not animating or transitioning)
    ezt(el).getTranslation(true);

*Hope you find some fun in helping out with this, or using it! Thanks!*