# stereogram-solver
An autostereogram (also known as Magic Eye) is a 2D image designed to create the illusion of 3D. In each image, there is a 3D object that can only be viewed by looking at the image a certain way, as if the screen was transparent and you looked at the wall behind it.

Correctly viewing a Magic Eye definitely takes some practice, and some people are completely unable to see them. This website is a tool to reveal the 3D scene hidden in a stereogram by revealing its silhouette. It works for most of autosterograms, especially if they have a simple plane as background.

See it live [here](https://piellardj.github.io/stereogram-solver/).

See my Magic Eye generator [here](https://piellardj.github.io/stereogram-webgl/).

## Preview

![Shark](src/readme/shark.jpg)

![Thumbs up](src/readme/thumbsup.jpg)

![Planet](src/readme/planet.jpg)


## Algorithm
As described in my Magic Eye generator project, a stereogram is all about horizontal repetition of a certain pattern, and the repetition frequency depends on the local depth of the scene.

This means that to reconstruct a depth map from a stereogram, we can first try to determine the frequency, and then we rebuild the depth map from it. In this project, I simply compute the difference between the image and a shifted version of itself. This way, when I hit the right period, the difference is very small and the pixels appear black. This can very easily be visualized by slowly moving the slider that controls the size of the lateral shift.

<div style="text-align:center">
    <img alt="Depth progression" src="src/readme/depth-progression.jpg"/>
    <p>
        <i>By varying the displacement, one can clearly see the 3D at different depths.</i>
    </p>
</div>


In theory, I could use this technique to automatically rebuild a full depth map of the image, however I did not achieve great result with it. My guess is that I would need to apply a kind of blur to the source image beforehand, in order to remove artifacts. This is why I restricted my self to building only a binary version of the depth map: I determine what is in the background (black) and the rest of the scene is only shown as a colored silhouette. Of course, this only works for stereograms that have a background plane. For stereograms that don't, for instance a ripple that takes the whole image, this technique is not very effective. Moving the slider manually can still give an idea of the scene.

To determine the period of the background plane, I compute the global difference for varying displacements, and choose the best one based on its value and its neighbours. Here is an example of curve showing how the difference varies with displacement:

<div style="text-align:center">
    <img alt="Depth progression" src="src/readme/graph.png"/>
    <p>
        <i>The period of repetition for the background for the shark image is clearly visible around 140px.</i>
    </p>
</div>


## Results
I obtained surprisingly good results with this technique. It is also quite resistant to image alterations, such as jpeg artifacts, blur, black and white transformation, etc.

Here is a comparison between a source depth map, the corresponding stereogram, and the reconstruction of the depth map with this technique:

<div style="text-align:center">
    <img alt="Source depth map" src="src/readme/results_source.png"/>
    <p>
        <i>Source depth map.</i>
    </p>
</div>

<div style="text-align:center">
    <img alt="Corresponding stereogram" src="src/readme/results_image.jpg"/>
    <p>
        <i>Corresponding stereogram</i>
    </p>
</div>

<div style="text-align:center">
    <img alt="Rebuilt depth map" src="src/readme/results_rebuilt.jpg"/>
    <p>
        <i>Depth map rebuilt by analyzing the Magic Eye image.</i>
    </p>
</div>