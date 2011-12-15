Easy Transform v0.0000000000000000001a
-
**Making 2D* transforms easier to work with since 2011**
_______

######Skip to the bottom for full method listing

CSS transforms are easy:

    el.style.transform = 'rotate(20deg) translate(20px, 100px) scale(1.2)';

But let's face it, after that point, it's pretty tedious to manipulate an already added transform. This is where Easy Transform comes in. To do the above example with easy transform, all we gotta do is:

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

###CURRENT FUN
    //Creates an Easy Transform element for the element
    ezt(el);

    //This will stop an animation/transition in place.
    ezt(el).stopTransform();

    //This will rotate an element 20 degrees CC -  Currently this will always add to any other rotation applied. 
    ezt(el).rotate(20);

    //This will translate an element, specified in pixels.
    ezt(el).translate(20) //x = 20, y = 20
    ezt(el).translate(20, 40) //x = 20, y = 40

    //This will scale an element
    ezt(el).scale(1.2) // x= 1.2, y = 1.2
    ezt(el).skew(1.2, 1.5) //x = 1.2, y = 1.5

    //This will skew an element, specified in degrees
    ezt(el).skew(20) // x= 20, y = 20
    ezt(el).skew(20, 40) //x = 20, y = 40

    //This will add an entire transform to the element
    ezt(el).transform('rotate(20deg) scale(1.5) translate(20px, 30px)');

    //If end is true, the returned value will be the static ending transform.

    ezt(el).getRotation(end);

    ezt(el).getTranslation(end);

    ezt(el).getScale(end);

    ezt(el).getSkew(end);

    //live - (boolean) Returns live transform in a readable string
    //asMatrix - (boolean) Returns the 2d matrix of the transform
    ezt(el).getTransform(live asMatrix);
    
    //asArray - (boolean) returns 2d matrix as JS array
    ezt(el).getLiveMatrix(asArray)

#####*3D once 2D solidified, shouldn't be too far off.
*Hope you find some fun in helping out with this, or using it! Thanks!*